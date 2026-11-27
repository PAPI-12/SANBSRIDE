import React, { useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  Check,
  MapPin,
  Navigation,
  X,
} from 'lucide-react';
import {
  formatDate,
  formatStamp,
  getJourneyState,
  getStatusMeta,
} from '../domain.js';
import { BRAND_ARTWORK, COLORS, MAP_PALETTE } from '../design-system/tokens.js';

export function BrandMark({ size = 30, tone = 'white', color = '', className = '' }) {
  const fill = color || (tone === 'white' ? COLORS.white : tone === 'ink' ? COLORS.ink : 'var(--accent)');
  const height = size;
  const width = size * BRAND_ARTWORK.aspectRatio;
  return <svg
    className={`brand-mark ${className}`.trim()}
    width={width.toFixed(2)}
    height={height}
    viewBox={BRAND_ARTWORK.viewBox}
    aria-hidden="true"
    focusable="false"
  >
    <path d={BRAND_ARTWORK.markPath} fill={fill} fillRule="evenodd" />
  </svg>;
}

export function BrandDefs() {
  return null;
}

export function SanbsBrand({ className = '', compact = false, light = false }) {
  const classes = ['brand', compact ? 'brand-compact' : '', light ? 'brand-light' : '', className].filter(Boolean).join(' ');
  return <span className={classes}>
    <BrandMark size={30} tone={light ? 'white' : 'accent'} />
    {!compact && <span className="brand-word">RIDE</span>}
  </span>;
}

export function StatusChip({ booking, status, compact = false }) {
  const meta = getStatusMeta(booking || status || 'awaiting_assignment');
  return <span className={`status-chip tone-${meta.tone}${compact ? ' status-chip-compact' : ''}`}><i />{meta.label}</span>;
}

export function OriginTag({ origin }) {
  const isStaff = origin === 'staff';
  return <span className={`origin-tag ${isStaff ? 'origin-staff' : 'origin-donor'}`}>{isStaff ? 'Staff-assisted' : 'Donor self-booked'}</span>;
}

export function DriverAvatar({ driver, size = 'normal' }) {
  const initials = driver?.initials || driver?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'DR';
  return <span className={`driver-avatar avatar-${driver?.color || 'red'} avatar-${size}`} aria-hidden="true">{initials}</span>;
}

export function SectionHeading({ eyebrow, title, subtitle, action, className = '' }) {
  return (
    <div className={`section-heading ${className}`}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {subtitle && <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 'var(--fs-sm)', maxWidth: '68ch' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function useDialogA11y(onClose) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const previousFocus = document.activeElement;
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = () => [...dialog.querySelectorAll(focusableSelector)].filter((item) => item.getClientRects().length > 0);
    (focusable()[0] || dialog).focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener('keydown', onKeyDown);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return dialogRef;
}

export function ModalFrame({ title, subtitle, onClose, children, footer, size = 'medium', className = '' }) {
  const dialogRef = useDialogA11y(onClose);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section ref={dialogRef} tabIndex={-1} className={`modal-frame modal-${size} ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}

export function Field({ label, hint, error, children, className = '' }) {
  return <label className={`field ${className}`}>
    <span className="field-label">{label}</span>
    {children}
    {error && <span className="field-hint" style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>{error}</span>}
    {!error && hint && <span className="field-hint">{hint}</span>}
  </label>;
}

export function EmptyState({ icon: Icon = MapPin, title, description, action, compact = false }) {
  return (
    <div className={`empty-state${compact ? ' empty-compact' : ''}`}>
      <span className="empty-icon"><Icon size={19} strokeWidth={1.8} /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

function pointAtProgress(points, progress) {
  const normalized = Math.max(0, Math.min(progress, 1)) * (points.length - 1);
  const index = Math.min(Math.floor(normalized), points.length - 2);
  const localProgress = normalized - index;
  const [x1, y1] = points[index];
  const [x2, y2] = points[index + 1];
  return [x1 + (x2 - x1) * localProgress, y1 + (y2 - y1) * localProgress];
}

function routePlaceLabel(value) {
  const place = String(value || '').trim();
  const parts = place.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) return parts[1];
  return place.replace(/^SANBS\s+/i, '').replace(/\s+(Donor Centre|Blood Drive)$/i, '').slice(0, 20);
}

export function RouteMap({
  from = 'Sandown',
  to = 'SANBS Sandton',
  progress = 0.08,
  reverse = false,
  compact = false,
  dark = true,
  hideChrome = false,
  actionLabel = '',
  onAction,
  helper,
  onUseCurrent,
}) {
  const palette = dark ? MAP_PALETTE.stealth : MAP_PALETTE.light;
  const points = reverse
    ? [[374, 48], [322, 74], [258, 100], [198, 128], [128, 130], [66, 158]]
    : [[66, 158], [128, 130], [198, 128], [258, 100], [322, 74], [374, 48]];
  const [markerX, markerY] = pointAtProgress(points, progress);
  const pathString = `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
  const start = points[0];
  const end = points[points.length - 1];
  const originLabel = routePlaceLabel(reverse ? to : from);
  const destinationLabel = routePlaceLabel(reverse ? from : to);
  return (
    <div className={`route-map${compact ? ' route-map-compact' : ''}${dark ? ' route-map-dark' : ''}`}>
      {!hideChrome && <div className="map-overline"><span><MapPin size={12} /> {originLabel} → {destinationLabel}</span><span>STEALTH ROUTE</span></div>}
      <div className="map-art">
        <svg viewBox="0 0 440 205" role="img" aria-label={`Route from ${from} to ${to}`} preserveAspectRatio="xMidYMid meet">
          <rect width="440" height="205" fill={palette.background} />
          <g fill={palette.blocks} stroke={palette.blockStroke} strokeWidth="0.9">
            <path d="M10 10h70v40H10zM104 8h59v45h-59zM184 11h48v37h-48zM255 9h75v42h-75zM353 12h70v48h-70z" />
            <path d="M13 80h55v41H13zM94 75h73v48H94zM188 70h44v53h-44zM251 78h66v44h-66zM341 77h77v42h-77z" />
            <path d="M8 147h76v45H8zM107 151h68v45h-68zM201 154h71v42h-71zM294 148h48v48h-48zM365 145h58v50h-58z" />
          </g>
          <path d="M350 146 440 137v68H305z" fill={palette.park} opacity=".8" />
          <g fill="none" stroke={palette.road} strokeWidth="7" strokeLinecap="round">
            <path d="M0 65h440M0 137h440M86 0v205M174 0v205M244 0v205M330 0v205" />
            <path d="M-10 190 140 0M300 212 420 0" />
          </g>
          <g fill="none" stroke={palette.roadEdge} strokeWidth="0.8">
            <path d="M0 65h440M0 137h440M86 0v205M174 0v205M244 0v205M330 0v205" />
            <path d="M-10 190 140 0M300 212 420 0" />
          </g>
          {!hideChrome && <g fill={palette.streetLabel} fontFamily="Inter, Arial, sans-serif" fontSize="7" fontWeight="600" opacity=".85">
            <text x="100" y="61">Rivonia Road</text>
            <text x="255" y="133">Grayston Drive</text>
            <text x="82" y="112" transform="rotate(-90 82 112)">Katherine Street</text>
            <text x="326" y="101" transform="rotate(-90 326 101)">Oxford Road</text>
            <text x="181" y="79" transform="rotate(-35 181 79)">Sandton Drive</text>
          </g>}
          <path d={pathString} fill="none" stroke={palette.routeBase} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathString} fill="none" stroke={palette.routeHalo} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity={dark ? '.24' : '.36'} />
          <path d={pathString} fill="none" stroke={palette.route} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" pathLength="100" strokeDasharray={`${Math.max(progress * 100, 18)} 100`} />
          <circle cx={start[0]} cy={start[1]} r="9" fill={palette.start} opacity=".22" />
          <circle cx={start[0]} cy={start[1]} r="6" fill={palette.start} stroke={palette.startRing} strokeWidth="2.2" />
          <circle cx={end[0]} cy={end[1]} r="12" fill={palette.end} opacity=".24" />
          <circle cx={end[0]} cy={end[1]} r="7" fill={palette.end} stroke="#FFFFFF" strokeWidth="2" />
          {progress > 0.08 && progress < 1 && <g transform={`translate(${markerX} ${markerY})`}>
            <circle r="13" fill={palette.route} opacity=".22" />
            <circle r="8" fill={palette.vehicle} stroke={palette.vehicleStroke} strokeWidth="2" />
            <circle r="3" fill={palette.route} />
          </g>}
          {!hideChrome && <g fontFamily="Inter, Arial, sans-serif" fontSize="8.5" fontWeight="600">
            <rect x="15" y="170" rx="8" width="80" height="19" fill={palette.label} opacity=".94" />
            <text x="23" y="183" fill={palette.labelText}>{originLabel.slice(0, 14)}</text>
            <rect x="330" y="13" rx="8" width="96" height="19" fill={palette.label} opacity=".94" />
            <text x="338" y="26" fill={palette.labelText}>{destinationLabel.slice(0, 16)}</text>
          </g>}
        </svg>
        {onAction && actionLabel
          ? <button type="button" className="map-route-pill map-route-pill-cta" onClick={onAction}>{actionLabel}</button>
          : !hideChrome && <div className="map-route-pill"><Navigation size={12} /> {reverse ? 'Return route' : 'Pickup route'} <ArrowUpRight size={12} /></div>}
      </div>
      {(helper || onUseCurrent) && <div className="map-footer">
        {helper && <span>{helper}</span>}
        {onUseCurrent && <button type="button" className="map-action" onClick={onUseCurrent}><Navigation size={13} /> Use current location</button>}
      </div>}
    </div>
  );
}

export function JourneyTimeline({ booking, leg = 'outbound', compact = false }) {
  const returned = leg === 'return';
  const journey = getJourneyState(booking, leg);
  const { stages, index: currentIndex, status } = journey;

  if (!compact) {
    return <div className={`journey-timeline${returned ? ' timeline-return' : ''}`}>
      {stages.map((stage, i) => {
        const stepDone = journey.done ? i <= currentIndex : i < currentIndex;
        const current = !journey.done && i === currentIndex;
        return <div className={`timeline-step ${stepDone ? 'step-done' : ''} ${current ? 'step-current' : ''}`} key={stage.key}>
          <span className="timeline-marker">{stepDone ? <Check size={11} strokeWidth={3} /> : current ? <i /> : null}</span>
          <div className="timeline-copy">
            <strong>{stage.title}</strong>
            {(current || (journey.done && i === currentIndex)) && <span>{timelineDetail(booking, returned, status)}</span>}
          </div>
        </div>;
      })}
    </div>;
  }
  return (
    <div className={`mini-progress${returned ? ' mini-progress-return' : ''}`} aria-label={`Journey progress: ${journey.title}`}>
      {stages.map((stage, i) => {
        const stepDone = journey.done ? i <= currentIndex : i < currentIndex;
        const current = !journey.done && i === currentIndex;
        return <span className={`mini-progress-step ${stepDone ? 'step-done' : ''} ${current ? 'step-current' : ''}`} key={stage.key} title={stage.title}>
          <i>{stepDone ? <Check size={9} strokeWidth={3} /> : null}</i>
          {i < stages.length - 1 && <b />}
        </span>;
      })}
    </div>
  );
}

function timelineDetail(booking, returned, status) {
  if (returned) {
    if (status === 'awaiting_dispatch') return 'SANBS confirmed readiness. A driver will be assigned next.';
    if (status === 'driver_assigned') return 'Your return driver has been assigned.';
    if (status === 'driver_on_the_way') return 'Your driver is on the way to the centre.';
    if (status === 'driver_arrived') return 'Your driver is waiting at the centre.';
    if (status === 'donor_on_the_way_home') return 'You are on your way home.';
    if (status === 'completed') return 'Your ride is complete.';
  }
  if (status === 'awaiting_assignment') return 'We’ll let you know when a driver is assigned.';
  if (status === 'driver_assigned') return 'Your driver and vehicle are confirmed.';
  if (status === 'driver_on_the_way') return 'Your driver is heading to your pickup.';
  if (status === 'driver_arrived') return 'Your driver has arrived at pickup.';
  if (status === 'donor_picked_up') return 'Your driver is taking you to the donation site.';
  if (status === 'arrived_at_site') return booking.returnRequested ? 'The SANBS team will arrange your return when you are ready.' : 'You have arrived at your donation site.';
  return '';
}

export function RelativeStamp({ stamp }) {
  return <time>{formatStamp(stamp)}</time>;
}

export function DateLine({ date, time }) {
  return <span>{formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' })} · {time}</span>;
}

export function IconButton({ icon: Icon = X, label, onClick, className = '' }) {
  return <button className={`icon-button ${className}`} type="button" aria-label={label} title={label} onClick={onClick}><Icon size={17} /></button>;
}
