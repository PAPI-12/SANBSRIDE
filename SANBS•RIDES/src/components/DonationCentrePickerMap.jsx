import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

function centrePin(L, selected) {
  const html = `<span class="donor-centre-drop${selected ? ' is-selected' : ''}" aria-hidden="true"><svg viewBox="0 0 32 42"><path d="M16 1C7.7 1 1 7.7 1 16c0 10.3 15 25 15 25s15-14.7 15-25C31 7.7 24.3 1 16 1Z" fill="#D42127" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5.2" fill="#fff"/><circle cx="16" cy="16" r="2.3" fill="#D42127"/></svg></span>`;
  return L.divIcon({
    className: 'donor-centre-drop-icon',
    html,
    iconSize: [36, 46],
    iconAnchor: [18, 43],
    tooltipAnchor: [0, -38],
  });
}

export default function DonationCentrePickerMap({ locations, selectedLocationId, onSelect }) {
  const hostRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef(new Map());
  const selectedIdRef = useRef(selectedLocationId);
  const onSelectRef = useRef(onSelect);
  selectedIdRef.current = selectedLocationId;
  onSelectRef.current = onSelect;

  useEffect(() => {
    let disposed = false;
    let map;
    let resizeObserver;

    const initialize = async () => {
      try {
        const L = (await import('leaflet')).default;
        if (disposed || !hostRef.current) return;
        const points = locations
          .filter((location) => Number.isFinite(Number(location.coordinates?.lat)) && Number.isFinite(Number(location.coordinates?.lon)))
          .map((location) => [Number(location.coordinates.lat), Number(location.coordinates.lon)]);
        if (!points.length) return;

        map = L.map(hostRef.current, {
          zoomControl: false,
          attributionControl: true,
          scrollWheelZoom: false,
          tap: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);

        const markers = new Map();
        locations.forEach((location) => {
          const lat = Number(location.coordinates?.lat);
          const lon = Number(location.coordinates?.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
          const marker = L.marker([lat, lon], {
            icon: centrePin(L, location.id === selectedIdRef.current),
            title: `Select ${location.name}`,
            keyboard: true,
            riseOnHover: true,
          }).addTo(map);
          marker.bindTooltip(location.name, { direction: 'top', offset: [0, -4] });
          marker.on('click', () => onSelectRef.current?.(location.id));
          markers.set(location.id, marker);
        });
        map.fitBounds(points, { padding: [28, 28], maxZoom: 12, animate: false });
        markersRef.current = markers;
        leafletRef.current = L;
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
          resizeObserver.observe(hostRef.current);
        }
        window.setTimeout(() => map?.invalidateSize({ pan: false }), 0);
      } catch (error) {
        if (!disposed) console.warn('Donor centre map could not be initialized.', error);
      }
    };

    initialize();
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      map?.remove();
      leafletRef.current = null;
      markersRef.current = new Map();
    };
  }, [locations]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!L) return;
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(centrePin(L, id === selectedLocationId));
    });
  }, [locations, selectedLocationId]);

  return <div className="donor-centre-map" ref={hostRef} role="group" aria-label="Map of SANBS donor centres. Select a red drop to choose a centre." />;
}
