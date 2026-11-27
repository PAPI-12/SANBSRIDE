import React, { useEffect, useId, useRef, useState } from 'react';
import { Compass, LocateFixed } from 'lucide-react';
import { friendlyServiceMessage } from '../services/http.js';
import { getJourneyMapState } from '../domain.js';
import { getBookingRoute } from '../services/routing.js';

const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DROP_PATH = 'M12 1C12 1 2.5 12.5 2.5 19a9.5 9.5 0 0 0 19 0C21.5 12.5 12 1 12 1Z';
const HOME_PIN = '<span class="journey-pin journey-pin-home" aria-hidden="true"><span class="journey-origin-beacon"></span></span>';
const CAR_PIN = '<span class="journey-pin journey-pin-car"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 11h18v5H3z"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></svg></span>';
const NAVIGATION_PIN = '<span class="journey-pin journey-pin-navigation" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 5 5 42l19-9 19 9L24 5Z"/></svg></span>';

function whiteDropPin(clipId) {
  return `<span class="journey-pin-drop-marker"><svg viewBox="0 0 24 30" aria-hidden="true"><defs><clipPath id="${clipId}"><path d="${DROP_PATH}"/></clipPath></defs><path d="${DROP_PATH}" fill="#181B22"/><rect class="journey-drop-liquid" x="0" y="30" width="24" height="30" fill="#D42127" clip-path="url(#${clipId})"/><path d="${DROP_PATH}" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="18.2" r="2.6" fill="#FFFFFF" opacity=".92"/></svg></span>`;
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

function fitRoute(map, path, {
  paddingTopLeft = [44, 44],
  paddingBottomRight = [44, 44],
  maxZoom = 14,
} = {}) {
  if (path.length < 2) return;
  const size = map.getSize();
  if (!size.x || !size.y) return;
  const clampPair = (start, end, span) => {
    const maxPad = Math.max(0, span - 80);
    const sum = start + end;
    if (sum <= maxPad) return [start, end];
    const ratio = sum > 0 ? maxPad / sum : 0;
    return [Math.floor(start * ratio), Math.floor(end * ratio)];
  };
  const [padLeft, padRight] = clampPair(paddingTopLeft[0], paddingBottomRight[0], size.x);
  const [padTop, padBottom] = clampPair(paddingTopLeft[1], paddingBottomRight[1], size.y);
  map.fitBounds(path, {
    paddingTopLeft: [padLeft, padTop],
    paddingBottomRight: [padRight, padBottom],
    maxZoom,
    animate: false,
  });
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

function nextArrowAngle(previousAngle, screenHeading) {
  const target = screenHeading + 90;
  if (previousAngle == null) return ((target % 360) + 360) % 360;
  const delta = (((target - previousAngle) % 360) + 540) % 360 - 180;
  return previousAngle + delta;
}

export default function JourneyMap({
  booking,
  leg = 'outbound',
  from = 'Pickup',
  to = 'Donation centre',
  controls = false,
  liveControl = false,
  navigationStyle = false,
  scrollWheelZoom = false,
  fitPaddingTopLeft = [44, 44],
  fitPaddingBottomRight = [44, 44],
  maxFitZoom = 14,
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
  const [following, setFollowing] = useState(navigationStyle);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const progressRef = useRef(0);
  const fillProgressRef = useRef(0);
  const hasDriverRef = useRef(false);
  const mapState = getJourneyMapState(booking, leg, clock);
  const { phase, progress } = mapState;
  const legRecord = booking[leg === 'return' ? 'returnLeg' : 'outbound'];
  const hasDriver = Boolean(legRecord?.driverId);
  const simulatedNavigation = legRecord?.navigationMode === 'simulated';
  const liveFixAge = legRecord?.currentPosition?.updatedAt ? Date.now() - Date.parse(legRecord.currentPosition.updatedAt) : Infinity;
  const driverPosition = legRecord?.navigationMode === 'live' && liveFixAge < 15_000 ? legRecord.currentPosition : null;
  const driverPositionRef = useRef(null);
  const simulatedRef = useRef(simulatedNavigation);
  const fitOptionsRef = useRef({
    paddingTopLeft: fitPaddingTopLeft,
    paddingBottomRight: fitPaddingBottomRight,
    maxZoom: maxFitZoom,
  });
  fitOptionsRef.current = {
    paddingTopLeft: fitPaddingTopLeft,
    paddingBottomRight: fitPaddingBottomRight,
    maxZoom: maxFitZoom,
  };
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
        mapInstance = L.map(hostRef.current, {
          zoomControl: false,
          attributionControl: true,
          scrollWheelZoom,
          ...(navigationStyle ? { inertia: false, bounceAtZoomLimits: false } : {}),
        });
        L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(mapInstance);
        const pinIcon = (html, size = [34, 34], anchor = [17, 17]) => L.divIcon({ className: 'journey-pin-wrap', html, iconSize: size, iconAnchor: anchor });
        if (navigationStyle) {
          L.polyline(path, { color: 'rgba(255, 59, 66, 0.28)', weight: 14, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
          L.polyline(path, { color: '#272B35', weight: 9, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
        } else {
          L.polyline(path, { color: 'rgba(255, 59, 66, 0.24)', weight: 12, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
          L.polyline(path, { color: '#2D323E', weight: 5, opacity: 0.92, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
        }
        L.polyline(path, { color: '#FF3B42', weight: navigationStyle ? 4.5 : 3.5, opacity: 0.42, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
        const travelled = L.polyline([path[0]], { color: '#FF3B42', weight: navigationStyle ? 6 : 5.5, lineCap: 'round', lineJoin: 'round' }).addTo(mapInstance);
        const pickupMarker = L.marker([route.pickup.lat, route.pickup.lon], {
          icon: pinIcon(HOME_PIN, [26, 26], [13, 13]), keyboard: false, title: `Verified pickup: ${booking.pickupAddress}`,
          opacity: navigationStyle ? 0 : 1,
        }).addTo(mapInstance);
        pickupMarker.bindTooltip(booking.pickupAddress, { direction: 'top', offset: [0, -10] });
        const dropMarker = L.marker([route.centre.lat, route.centre.lon], {
          icon: pinIcon(whiteDropPin(clipId), [40, 50], [20, 42]),
          keyboard: false,
          opacity: navigationStyle ? 0 : 1,
          title: `Selected SANBS centre: ${booking.appointment.locationName}`,
        }).addTo(mapInstance);
        dropMarker.bindTooltip(booking.appointment.locationName, { direction: 'top', offset: [0, -16] });
        const car = L.marker(path[0], {
          icon: navigationStyle ? pinIcon(NAVIGATION_PIN, [58, 58], [29, 29]) : pinIcon(CAR_PIN),
          zIndexOffset: 600,
          keyboard: false,
          title: 'Driver live GPS position',
          opacity: hasDriverRef.current ? 1 : 0,
        }).addTo(mapInstance);
        const fitBoundsList = [...path, [route.pickup.lat, route.pickup.lon], [route.centre.lat, route.centre.lon]];
        const keepDriverInFocus = (point, targetZoom = null) => {
          if (live.zooming) return;
          const zoomLevel = Number.isFinite(targetZoom) ? targetZoom : (mapInstance.getZoom() || 17);
          if (!navigationStyle) {
            mapInstance.setView(point, zoomLevel, { animate: false });
            return;
          }
          const size = mapInstance.getSize();
          if (!size.x || !size.y) {
            mapInstance.setView(point, zoomLevel, { animate: false });
            return;
          }
          // Anchor the car cleanly in the open map window between the turn banner and bottom sheet.
          const projected = mapInstance.project(point, zoomLevel);
          const targetCenter = mapInstance.unproject([projected.x, projected.y - size.y * 0.04], zoomLevel);
          mapInstance.setView(targetCenter, zoomLevel, { animate: false });
        };
        const live = {
          map: mapInstance,
          path,
          pinBounds: [[route.pickup.lat, route.pickup.lon], [route.centre.lat, route.centre.lon]],
          car,
          travelled,
          follow: navigationStyle,
          userAdjusted: false,
          zooming: false,
          arrowAngle: null,
          lastPoint: path[0],
          keepDriverInFocus,
          dropLiquid: dropMarker.getElement()?.querySelector('.journey-drop-liquid') || null,
        };
        liveRef.current = live;
        setFollowing(navigationStyle);
        if (navigationStyle) {
          keepDriverInFocus(pointAlongRoute(path, progressRef.current).point, 17);
        } else {
          fitRoute(mapInstance, fitBoundsList, fitOptionsRef.current);
        }
        const placeCar = (nextProgress, fillProgress) => {
          const { point: routePoint, travelled: line } = pointAlongRoute(path, nextProgress);
          if (navigationStyle && hostRef.current) {
            const screenHeading = routeScreenHeading(path, nextProgress);
            live.arrowAngle = nextArrowAngle(live.arrowAngle, screenHeading);
            hostRef.current.style.setProperty('--driver-arrow-rotation', `${live.arrowAngle}deg`);
          }
          const fix = driverPositionRef.current;
          const hasLiveFix = Number.isFinite(Number(fix?.lat)) && Number.isFinite(Number(fix?.lon))
            && Math.abs(Number(fix.lat)) <= 90 && Math.abs(Number(fix.lon)) <= 180;
          const point = hasLiveFix ? [Number(fix.lat), Number(fix.lon)] : routePoint;
          live.lastPoint = point;
          car.setLatLng(point);
          travelled.setLatLngs([path[0], ...line].filter((item, index, array) => index === 0 || item[0] !== array[index - 1][0] || item[1] !== array[index - 1][1]));
          live.dropLiquid?.setAttribute('y', String(30 * (1 - Math.max(0, Math.min(fillProgress, 1)))));
          if (live.follow) {
            if (navigationStyle) {
              keepDriverInFocus(point);
            } else {
              mapInstance.panTo(point, { animate: true, duration: 0.2, easeLinearity: 1 });
            }
          }
        };
        live.placeCar = placeCar;
        placeCar(progressRef.current, fillProgressRef.current);
        mapInstance.on('dragstart', () => {
          live.follow = false;
          live.userAdjusted = true;
          setFollowing(false);
        });
        mapInstance.on('zoomstart', () => {
          live.zooming = true;
        });
        mapInstance.on('zoomend', () => {
          live.zooming = false;
          if (navigationStyle && live.follow && live.lastPoint) {
            keepDriverInFocus(live.lastPoint);
          }
        });
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            if (disposed || !mapInstance) return;
            mapInstance.invalidateSize({ pan: false });
            if (navigationStyle) {
              if (live.follow && live.lastPoint) keepDriverInFocus(live.lastPoint);
            } else if (!live.userAdjusted) {
              fitRoute(mapInstance, fitBoundsList, fitOptionsRef.current);
            }
          });
          resizeObserver.observe(hostRef.current);
        }
        window.setTimeout(() => {
          if (disposed || !mapInstance) return;
          mapInstance.invalidateSize({ pan: false });
          if (navigationStyle) {
            if (live.follow) keepDriverInFocus(live.lastPoint, mapInstance.getZoom() || 17);
          } else if (!live.userAdjusted) {
            fitRoute(mapInstance, fitBoundsList, fitOptionsRef.current);
          }
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
  }, [retryToken, booking.id, booking.appointment.coordinates?.lat, booking.appointment.coordinates?.lon, booking.appointment.locationId, booking.appointment.locationName, booking.pickupAddress, booking.pickupCoordinates?.lat, booking.pickupCoordinates?.lon, booking[leg === 'return' ? 'returnLeg' : 'outbound']?.driverId, booking[leg === 'return' ? 'returnLeg' : 'outbound']?.driverCoordinates?.lat, booking[leg === 'return' ? 'returnLeg' : 'outbound']?.driverCoordinates?.lon, clipId, leg, maxFitZoom, navigationStyle, phase, scrollWheelZoom]);

  useEffect(() => {
    liveRef.current?.placeCar(progress, mapState.fillProgress);
    liveRef.current?.car.setOpacity(hasDriver ? 1 : 0);
  }, [progress, mapState.fillProgress, hasDriver, driverPosition?.lat, driverPosition?.lon]);

  useEffect(() => {
    const live = liveRef.current;
    if (!focusToken || !live) return;
    live.follow = true;
    live.userAdjusted = false;
    setFollowing(true);
    const position = driverPositionRef.current;
    const point = Number.isFinite(Number(position?.lat)) && Number.isFinite(Number(position?.lon))
      ? [Number(position.lat), Number(position.lon)]
      : pointAlongRoute(live.path, progressRef.current).point;
    if (navigationStyle) live.keepDriverInFocus(point, 17);
    else live.map.flyTo(point, 16, { duration: 0.8 });
  }, [focusToken, navigationStyle]);

  const followLive = () => {
    const live = liveRef.current;
    if (!live) return;
    live.follow = true;
    live.userAdjusted = false;
    setFollowing(true);
    const position = driverPositionRef.current;
    const point = Number.isFinite(Number(position?.lat)) && Number.isFinite(Number(position?.lon))
      ? [Number(position.lat), Number(position.lon)]
      : pointAlongRoute(live.path, progressRef.current).point;
    if (navigationStyle) live.keepDriverInFocus(point, 17);
    else live.map.flyTo(point, 16, { duration: 0.8 });
  };
  const recenter = () => {
    const live = liveRef.current;
    if (!live) return;
    live.follow = false;
    live.userAdjusted = false;
    setFollowing(false);
    fitRoute(live.map, [...live.path, live.pinBounds?.[0], live.pinBounds?.[1]].filter(Boolean), fitOptionsRef.current);
  };
  const zoom = (direction) => {
    const live = liveRef.current;
    if (!live) return;
    live.userAdjusted = true;
    if (direction > 0) live.map.zoomIn();
    else live.map.zoomOut();
  };

  return <>
    <div className={`${className} is-stealth-map${navigationStyle ? ' is-navigation-map' : ''}`} ref={hostRef} />
    <p className="sr-only">{`Route from ${from} to ${to}. Pickup: ${booking.pickupAddress}. Destination: ${booking.appointment.locationName}.`}</p>
    {mapError && <div className="journey-map-error" role="status">
      <strong>Map unavailable</strong>
      <span>{mapError}</span>
      <button type="button" className="journey-map-retry" onClick={() => setRetryToken((value) => value + 1)}>Try again</button>
    </div>}
    {!mapError && approximate && <div className="journey-approx-chip" role="status">Approximate route · road directions unavailable</div>}
    {controls && !mapError && <>
      <button className="journey-compass" type="button" onClick={recenter} aria-label="Recenter map"><Compass size={20} aria-hidden="true" /></button>
      {liveControl && <button className={`journey-live-control${following ? ' is-following' : ''}`} type="button" onClick={followLive} aria-label="Follow live driver location" aria-pressed={following}><LocateFixed size={20} /><span>Live</span></button>}
      <div className="journey-zoom" role="group" aria-label="Map zoom">
        <button type="button" onClick={() => zoom(1)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoom(-1)} aria-label="Zoom out">−</button>
      </div>
    </>}
  </>;
}
