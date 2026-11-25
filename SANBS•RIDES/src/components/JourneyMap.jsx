import React, { useEffect, useId, useRef, useState } from 'react';
import { Compass, LocateFixed, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { friendlyServiceMessage } from '../services/http.js';
import { getJourneyMapState } from '../domain.js';
import { getBookingRoute } from '../services/routing.js';

const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DROP_PATH = 'M12 1C12 1 2.5 12.5 2.5 19a9.5 9.5 0 0 0 19 0C21.5 12.5 12 1 12 1Z';
const HOME_PIN = '<span class="journey-pin journey-pin-home"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg></span>';
const CAR_PIN = '<span class="journey-pin journey-pin-car"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 11h18v5H3z"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></svg></span>';
const NAVIGATION_PIN = '<span class="journey-pin journey-pin-navigation" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 5 5 42l19-9 19 9L24 5Z"/></svg></span>';

function whiteDropPin(clipId) {
  return `<span class="journey-pin-drop-marker"><svg viewBox="0 0 24 30" aria-hidden="true"><defs><clipPath id="${clipId}"><path d="${DROP_PATH}"/></clipPath></defs><path d="${DROP_PATH}" fill="#fff"/><rect class="journey-drop-liquid" x="0" y="30" width="24" height="30" fill="#D42127" clip-path="url(#${clipId})"/><path d="${DROP_PATH}" fill="none" stroke="#7C0F13" stroke-width="1.4" stroke-linejoin="round"/><ellipse cx="8.2" cy="17.5" rx="1.9" ry="3.2" fill="#fff" opacity=".45" transform="rotate(18 8.2 17.5)"/></svg></span>`;
}

function pointAlongRoute(path, fraction) {
  const segments = path.slice(1).map((end, index) => {
    const start = path[index];
    return { start, end, length: Math.hypot(end[0] - start[0], end[1] - start[1]) };
  });
  const total = segments.reduce((sum, segment) => sum + segment.length, 0) || 1;
  let remaining = Math.max(0, Math.min(fraction, 1)) * total;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (remaining <= segment.length || index === segments.length - 1) {
      const ratio = segment.length ? Math.min(remaining / segment.length, 1) : 0;
      return {
        point: [
          segment.start[0] + (segment.end[0] - segment.start[0]) * ratio,
          segment.start[1] + (segment.end[1] - segment.start[1]) * ratio,
        ],
        travelled: [...segments.slice(0, index).map((item) => item.start), [
          segment.start[0] + (segment.end[0] - segment.start[0]) * ratio,
          segment.start[1] + (segment.end[1] - segment.start[1]) * ratio,
        ]],
      };
    }
    remaining -= segment.length;
  }
  return { point: path[path.length - 1], travelled: path };
}

function fitRoute(map, path) {
  if (path.length < 2) return;
  /* Frame the whole route and keep both pins inside the view, with room for the on-map controls. */
  map.fitBounds(path, { padding: [40, 40], maxZoom: 15, animate: false });
}

function routeScreenHeading(path, fraction) {
  if (path.length < 2) return -90;
  const lengths = path.slice(1).map((end, index) => {
    const start = path[index];
    return Math.hypot((end[0] - start[0]) * 111_320, (end[1] - start[1]) * 111_320 * Math.cos(start[0] * Math.PI / 180));
  });
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  let remaining = Math.max(0, Math.min(1, fraction)) * total;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index];
    if (remaining <= length || index === lengths.length - 1) {
      const [startLat, startLon] = path[index];
      const [endLat, endLon] = path[index + 1];
      return Math.atan2(-(endLat - startLat), (endLon - startLon) * Math.cos(startLat * Math.PI / 180)) * 180 / Math.PI;
    }
    remaining -= length;
  }
  return -90;
}

export default function JourneyMap({
  booking,
  leg = 'outbound',
  from = 'Pickup',
  to = 'Donation centre',
  controls = false,
  liveControl = false,
  navigationStyle = false,
  className = 'journey-live-map',
  focusToken = 0,
}) {
  const hostRef = useRef(null);
  const liveRef = useRef(null);
  const clipId = `journey-drop-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [clock, setClock] = useState(Date.now());
  const [mapError, setMapError] = useState('');
  const [approximate, setApproximate] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const progressRef = useRef(0);
  const fillProgressRef = useRef(0);
  const hasDriverRef = useRef(false);
  const mapState = getJourneyMapState(booking, leg, clock);
  const { phase, progress } = mapState;
  const legRecord = booking[leg === 'return' ? 'returnLeg' : 'outbound'];
  const hasDriver = Boolean(legRecord?.driverId);
  const simulatedNavigation = legRecord?.navigationMode === 'simulated';
  /* The car is placed on the route by the shared journey timeline. Only a live, recent GPS fix
     from the driver's device overrides that; a stored or seeded position never does. */
  const liveFixAge = legRecord?.currentPosition?.updatedAt ? Date.now() - Date.parse(legRecord.currentPosition.updatedAt) : Infinity;
  const driverPosition = legRecord?.navigationMode === 'live' && liveFixAge < 15_000 ? legRecord.currentPosition : null;
  const driverPositionRef = useRef(null);
  const simulatedRef = useRef(simulatedNavigation);
  simulatedRef.current = simulatedNavigation;
  progressRef.current = progress;
  fillProgressRef.current = mapState.fillProgress;
  hasDriverRef.current = hasDriver;
  driverPositionRef.current = driverPosition;

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!mapState.moving || !pageVisible) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [mapState.moving, mapState.status, mapState.phase, pageVisible]);

  useEffect(() => {
    let disposed = false;
    let mapInstance = null;
    let resizeObserver = null;
    setMapError('');
    setApproximate(false);
    const initialize = async () => {
      try {
        const [L, route] = await Promise.all([
          import('leaflet').then((module) => module.default),
          getBookingRoute(booking, leg, phase),
        ]);
        if (disposed || !hostRef.current) return;
        const path = route.path;
        if (!disposed) setApproximate(Boolean(route.approximate));
        mapInstance = L.map(hostRef.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false });
        L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(mapInstance);
        const pinIcon = (html, size = [34, 34], anchor = [17, 17]) => L.divIcon({ className: 'journey-pin-wrap', html, iconSize: size, iconAnchor: anchor });
        if (navigationStyle) {
          L.polyline(path, { color: '#fff', weight: 14, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
          L.polyline(path, { color: '#151719', weight: 10, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
        } else {
          L.polyline(path, { color: '#808D99', weight: 7, opacity: 0.86, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
        }
        const travelled = L.polyline([path[0]], { color: navigationStyle ? '#E53B43' : '#D42127', weight: navigationStyle ? 6 : 7, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
        const pickupMarker = L.marker([route.pickup.lat, route.pickup.lon], {
          icon: pinIcon(HOME_PIN), keyboard: false, title: `Verified pickup: ${booking.pickupAddress}`,
          opacity: navigationStyle ? 0 : 1,
        }).addTo(mapInstance);
        pickupMarker.bindTooltip(booking.pickupAddress, { direction: 'top', offset: [0, -12] });
        const dropMarker = L.marker([route.centre.lat, route.centre.lon], {
          icon: pinIcon(whiteDropPin(clipId), [40, 50], [20, 25]),
          keyboard: false,
          opacity: navigationStyle ? 0 : 1,
          title: `Selected SANBS centre: ${booking.appointment.locationName}`,
        }).addTo(mapInstance);
        dropMarker.bindTooltip(booking.appointment.locationName, { direction: 'top', offset: [0, -12] });
        // The GPS fix is already pushed through shared app state. Update a
        // normal Leaflet marker directly rather than polling a GeoJSON source.
        const car = L.marker(path[0], {
          icon: navigationStyle ? pinIcon(NAVIGATION_PIN, [58, 58], [29, 29]) : pinIcon(CAR_PIN),
          zIndexOffset: 600,
          keyboard: false,
          title: 'Driver live GPS position',
          opacity: hasDriverRef.current ? 1 : 0,
        }).addTo(mapInstance);
        const live = {
          map: mapInstance,
          path,
          pinBounds: [[route.pickup.lat, route.pickup.lon], [route.centre.lat, route.centre.lon]],
          car,
          travelled,
          follow: navigationStyle,
          dropLiquid: dropMarker.getElement()?.querySelector('.journey-drop-liquid') || null,
        };
        liveRef.current = live;
        const keepDriverInFocus = (point) => {
          mapInstance.setView(point, navigationStyle ? 17 : mapInstance.getZoom(), { animate: false });
          if (!navigationStyle) return;
          const size = mapInstance.getSize();
          if (!size.x || !size.y) return;
          const markerPoint = mapInstance.latLngToContainerPoint(point);
          mapInstance.panBy([
            markerPoint.x - size.x / 2,
            markerPoint.y - size.y * 0.72,
          ], { animate: false });
        };
        if (navigationStyle) {
          keepDriverInFocus(pointAlongRoute(path, progressRef.current).point);
        } else {
          fitRoute(mapInstance, [...path, [route.pickup.lat, route.pickup.lon], [route.centre.lat, route.centre.lon]]);
        }
        const placeCar = (nextProgress, fillProgress) => {
          const { point: routePoint, travelled: line } = pointAlongRoute(path, nextProgress);
          if (navigationStyle && hostRef.current) {
            const screenHeading = routeScreenHeading(path, nextProgress);
            const mapRotation = ((-90 - screenHeading + 540) % 360) - 180;
            hostRef.current.style.setProperty('--driver-route-rotation', `${mapRotation}deg`);
          }
          const fix = driverPositionRef.current;
          const hasLiveFix = Number.isFinite(Number(fix?.lat)) && Number.isFinite(Number(fix?.lon))
            && Math.abs(Number(fix.lat)) <= 90 && Math.abs(Number(fix.lon)) <= 180;
          const point = hasLiveFix ? [Number(fix.lat), Number(fix.lon)] : routePoint;
          car.setLatLng(point);
          travelled.setLatLngs([path[0], ...line].filter((item, index, array) => index === 0 || item[0] !== array[index - 1][0] || item[1] !== array[index - 1][1]));
          live.dropLiquid?.setAttribute('y', String(30 * (1 - Math.max(0, Math.min(fillProgress, 1)))));
          if (live.follow) {
            if (navigationStyle) {
              keepDriverInFocus(point);
              const focusPoint = mapInstance.latLngToContainerPoint(point);
              hostRef.current?.style.setProperty('--camera-origin-x', `${focusPoint.x}px`);
              hostRef.current?.style.setProperty('--camera-origin-y', `${focusPoint.y}px`);
            } else {
              mapInstance.panTo(point, { animate: true });
            }
          }
        };
        live.placeCar = placeCar;
        placeCar(progressRef.current, fillProgressRef.current);
        mapInstance.on('dragstart', () => { live.follow = false; });
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => mapInstance?.invalidateSize({ pan: false }));
          resizeObserver.observe(hostRef.current);
        }
        window.setTimeout(() => {
          if (!mapInstance) return;
          mapInstance.invalidateSize({ pan: false });
          live.placeCar(progressRef.current, fillProgressRef.current);
        }, 80);
      } catch (error) {
        if (!disposed) setMapError(friendlyServiceMessage(error, 'We could not draw this route. Try again.'));
      }
    };
    initialize();
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      mapInstance?.remove();
      liveRef.current = null;
    };
  }, [retryToken, booking.id, booking.appointment.coordinates?.lat, booking.appointment.coordinates?.lon, booking.appointment.locationId, booking.appointment.locationName, booking.pickupAddress, booking.pickupCoordinates?.lat, booking.pickupCoordinates?.lon, booking[leg === 'return' ? 'returnLeg' : 'outbound']?.driverCoordinates?.lat, booking[leg === 'return' ? 'returnLeg' : 'outbound']?.driverCoordinates?.lon, clipId, leg, navigationStyle, phase]);

  useEffect(() => {
    liveRef.current?.placeCar(progress, mapState.fillProgress);
    liveRef.current?.car.setOpacity(hasDriver ? 1 : 0);
  }, [progress, mapState.fillProgress, hasDriver, driverPosition?.lat, driverPosition?.lon]);

  useEffect(() => {
    const live = liveRef.current;
    if (!focusToken || !live) return;
    live.follow = true;
    const position = driverPositionRef.current;
    const point = Number.isFinite(Number(position?.lat)) && Number.isFinite(Number(position?.lon))
      ? [Number(position.lat), Number(position.lon)]
      : pointAlongRoute(live.path, progressRef.current).point;
    live.map.flyTo(point, 16, { duration: 0.8 });
  }, [focusToken]);

  const followLive = () => {
    const live = liveRef.current;
    if (!live) return;
    live.follow = true;
    const position = driverPositionRef.current;
    const point = Number.isFinite(Number(position?.lat)) && Number.isFinite(Number(position?.lon))
      ? [Number(position.lat), Number(position.lon)]
      : pointAlongRoute(live.path, progressRef.current).point;
    live.map.flyTo(point, 16, { duration: 0.8 });
  };
  const recenter = () => {
    const live = liveRef.current;
    if (!live) return;
    live.follow = false;
    fitRoute(live.map, [...live.path, live.pinBounds?.[0], live.pinBounds?.[1]].filter(Boolean));
  };
  const zoom = (direction) => {
    if (direction > 0) liveRef.current?.map.zoomIn();
    else liveRef.current?.map.zoomOut();
  };

  return <>
    <div className={`${className}${navigationStyle ? ' is-navigation-map' : ''}`} ref={hostRef} />
    <p className="sr-only">{`Route from ${from} to ${to}. Pickup: ${booking.pickupAddress}. Destination: ${booking.appointment.locationName}.`}</p>
    {mapError && <div className="journey-map-error" role="status">
      <strong>Map unavailable</strong>
      <span>{mapError}</span>
      <button type="button" className="journey-map-retry" onClick={() => setRetryToken((value) => value + 1)}>Try again</button>
    </div>}
    {!mapError && approximate && <div className="journey-approx-chip" role="status">Approximate route · road directions unavailable</div>}
    {controls && !mapError && <>
      <button className="journey-compass" type="button" onClick={recenter} aria-label="Recenter map"><Compass size={20} aria-hidden="true" /></button>
      {liveControl && <button className="journey-live-control" type="button" onClick={followLive} aria-label="Follow live driver location"><LocateFixed size={20} /><span>Live</span></button>}
      <div className="journey-zoom" role="group" aria-label="Map zoom">
        <button type="button" onClick={() => zoom(1)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoom(-1)} aria-label="Zoom out">−</button>
      </div>
    </>}
  </>;
}
