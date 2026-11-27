import { DRIVER_SEEDS, LOCATIONS } from '../domain.js';
import { geocodePickupAddress } from './geocoding.js';
import { fetchWithRetry } from './http.js';

const OSRM_ROUTE = 'https://router.project-osrm.org/route/v1/driving';
const routeCache = new Map();

function coordinate(value) {
  if (!value || !Number.isFinite(Number(value.lat)) || !Number.isFinite(Number(value.lon))) return null;
  return { lat: Number(value.lat), lon: Number(value.lon) };
}

function describeStep(step) {
  const type = step.maneuver?.type || '';
  const modifier = step.maneuver?.modifier || '';
  const street = step.name?.trim();
  if (type === 'arrive') return `Arrive at ${street || 'your destination'}`;
  if (type === 'depart') return `Continue${street ? ` on ${street}` : ' straight'}`;
  if (type === 'roundabout' || type === 'rotary') return `Enter the roundabout${street ? ` toward ${street}` : ''}`;
  const verb = modifier.includes('left') ? 'Turn left'
    : modifier.includes('right') ? 'Turn right'
      : modifier === 'uturn' ? 'Make a U-turn'
        : type === 'merge' ? 'Merge'
          : type === 'fork' ? 'Keep' : 'Continue';
  return `${verb}${street ? ` onto ${street}` : ' straight'}`;
}

function normalizeRoute(route) {
  const steps = (route.legs || []).flatMap((leg) => leg.steps || []).map((step) => ({
    instruction: describeStep(step),
    name: step.name || '',
    distance: Number(step.distance) || 0,
    duration: Number(step.duration) || 0,
    maneuver: step.maneuver?.type || 'continue',
    modifier: step.maneuver?.modifier || '',
  })).filter((step) => step.distance > 0);
  return {
    path: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    steps,
    distance: Number(route.distance) || 0,
    duration: Number(route.duration) || 0,
  };
}

export async function getDrivingRoute(from, to) {
  const start = coordinate(from);
  const end = coordinate(to);
  if (!start || !end) throw new Error('A precise start and destination are required to build this route.');
  const key = [start.lat, start.lon, end.lat, end.lon].map((value) => Number(value).toFixed(5)).join(',');
  if (routeCache.has(key)) return routeCache.get(key);
  const url = `${OSRM_ROUTE}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson&steps=true&alternatives=false`;
  const request = fetchWithRetry(url, { headers: { Accept: 'application/json' } }).then(async (response) => {
    if (!response.ok) throw new Error('The road service is unavailable right now.');
    const result = await response.json();
    const route = result.routes?.[0];
    if (!route?.geometry?.coordinates?.length || route.geometry.coordinates.length < 2) {
      throw new Error('No road route was found between these locations.');
    }
    return normalizeRoute(route);
  });
  routeCache.set(key, request);
  try {
    return await request;
  } catch (error) {
    routeCache.delete(key);
    throw error;
  }
}

/** Great-circle distance in metres between two { lat, lon } points. */
export function haversineMetres(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Labelled straight-line stand-in used only when the road service is unavailable. */
export function approximateRoute(from, to) {
  const distance = haversineMetres(from, to);
  const steps = 12;
  const path = Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    return [from.lat + (to.lat - from.lat) * t, from.lon + (to.lon - from.lon) * t];
  });
  return {
    path,
    steps: [{ instruction: 'Approximate route: road directions are unavailable right now.', name: '', distance, duration: distance / 9.7, maneuver: 'continue', modifier: '' }],
    distance,
    duration: distance / 9.7,
    approximate: true,
  };
}

export async function getBookingRoute(booking, leg = 'outbound', phase = 'to_destination') {
  const appointment = booking.appointment || {};
  const selectedCentre = LOCATIONS.find((location) => location.id === appointment.locationId
    && location.name === appointment.locationName
    && location.address === appointment.locationAddress)
    || LOCATIONS.find((location) => location.name === appointment.locationName
      && location.address === appointment.locationAddress);
  const centre = coordinate(appointment.coordinates) || coordinate(selectedCentre?.coordinates);
  if (!centre) throw new Error('The selected SANBS centre has no verified map position.');
  let pickup = coordinate(booking.pickupCoordinates);
  if (!pickup) pickup = await geocodePickupAddress(booking.pickupAddress || '');
  const isReturn = leg === 'return';
  const driverLeg = booking[isReturn ? 'returnLeg' : 'outbound'] || {};
  let driver = coordinate(driverLeg.driverCoordinates);
  if (!driver && driverLeg.driverId) driver = coordinate(DRIVER_SEEDS.find((item) => item.id === driverLeg.driverId)?.currentCoordinates);
  let from;
  let to;
  if (phase === 'to_pickup' && driver) {
    from = driver;
    to = isReturn ? centre : pickup;
  } else if (phase === 'to_pickup' && !driver) {
    from = isReturn ? centre : pickup;
    to = isReturn ? pickup : centre;
  } else {
    from = isReturn ? centre : pickup;
    to = isReturn ? pickup : centre;
  }
  let route;
  try {
    route = await getDrivingRoute(from, to);
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    route = approximateRoute(from, to);
  }
  return { ...route, from, to, pickup, centre, driver };
}

/** Snap a device GPS fix to the nearest point on the OSRM path. */
export function projectProgressOnRoute(path, position) {
  const point = coordinate(position);
  if (!point || !Array.isArray(path) || path.length < 2) return null;
  const averageLatitude = point.lat * Math.PI / 180;
  const toLocal = ([lat, lon]) => ({ x: lon * Math.cos(averageLatitude), y: lat });
  const p = toLocal([point.lat, point.lon]);
  const segmentLengths = path.slice(1).map((next, index) => {
    const previous = path[index];
    const dLat = (next[0] - previous[0]) * 111_320;
    const dLon = (next[1] - previous[1]) * 111_320 * Math.cos(averageLatitude);
    return Math.hypot(dLat, dLon);
  });
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0) || 1;
  let travelled = 0;
  let best = { distanceSquared: Infinity, progress: 0 };
  path.slice(1).forEach((end, index) => {
    const start = path[index];
    const a = toLocal(start);
    const b = toLocal(end);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const denominator = dx * dx + dy * dy || 1;
    const fraction = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / denominator));
    const x = a.x + fraction * dx;
    const y = a.y + fraction * dy;
    const distanceSquared = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (distanceSquared < best.distanceSquared) {
      best = { distanceSquared, progress: (travelled + segmentLengths[index] * fraction) / totalLength };
    }
    travelled += segmentLengths[index];
  });
  const offRouteMeters = Math.sqrt(best.distanceSquared) * 111_320;
  return { progress: Math.min(1, Math.max(0, best.progress)), offRouteMeters };
}
