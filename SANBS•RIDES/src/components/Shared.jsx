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

/* The SANBS heartbeat mark, vector-traced from the official artwork so the
   silhouette is identical at any size. Normalised to a 100-unit tall box. */
const BRAND_VIEWBOX = '0 0 76.02 100';
const BRAND_MARK = 'M 39.06 0.49 C 39.57 1.34 39.57 1.34 39.77 2.22 C 40.11 3.31 40.6 3.99 41.27 4.9 C 41.5 5.53 41.72 6.14 41.94 6.77 C 42.28 7.28 42.62 7.78 42.96 8.29 C 43.3 8.97 43.64 9.65 43.98 10.33 C 44.1 10.46 44.1 10.46 44.66 11.18 C 45.66 12.77 46.49 14.35 47.2 16.1 C 47.69 16.82 47.69 16.82 48.22 17.45 C 48.39 17.67 48.54 17.89 48.71 18.11 C 49.47 19.11 50.24 20.1 51 21.08 C 52.75 23.34 52.75 23.34 53.44 24.56 C 54.04 25.49 54.75 26.27 55.51 27.09 C 55.95 27.54 56.36 28.04 56.75 28.53 C 57.62 29.58 58.53 30.56 59.48 31.55 C 59.89 32 60.31 32.45 60.7 32.92 C 61.16 33.43 61.64 33.92 62.13 34.41 C 62.25 34.63 62.35 34.85 62.47 35.09 C 62.69 35.21 62.91 35.31 63.14 35.43 C 63.53 35.94 63.94 36.45 64.33 36.96 C 64.7 37.36 65.08 37.75 65.45 38.16 C 66.21 38.96 66.89 39.79 67.55 40.69 C 67.94 41.15 68.35 41.59 68.74 42.05 C 69.84 43.3 70.35 44.57 70.95 46.12 C 71.17 46.39 71.39 46.68 71.62 46.96 C 71.96 47.69 72.3 48.44 72.64 49.17 C 72.8 49.41 72.93 49.66 73.08 49.92 C 73.64 50.98 73.88 52.07 74.17 53.24 C 74.3 53.66 74.46 54.07 74.61 54.51 C 75.12 56.28 75.34 58.02 75.53 59.85 C 75.56 60.14 75.59 60.45 75.63 60.75 C 75.97 65.21 76.02 69.95 74.17 74.1 C 73.95 75 73.71 75.92 73.49 76.81 C 72.98 77.49 72.98 77.49 72.13 77.49 C 71.79 76.32 71.74 75.41 71.73 74.2 C 71.73 73.83 71.73 73.46 71.71 73.08 C 71.79 72.07 71.79 72.07 72.47 70.71 C 73.47 66.69 72.61 61.02 70.88 57.29 C 70.44 56.29 70.44 56.29 70.06 55.04 C 69.39 52.8 68.45 50.58 66.88 48.83 C 66.59 48.39 66.3 47.93 66.03 47.47 C 65.52 46.69 65.01 45.95 64.43 45.22 C 63.82 44.42 63.82 44.42 63.16 43.42 C 62.48 42.4 61.74 41.47 60.94 40.52 C 60.69 40.21 60.43 39.89 60.18 39.57 C 59.43 38.69 58.67 37.82 57.89 36.96 C 57.7 36.75 57.53 36.53 57.34 36.31 C 56.67 35.57 55.97 34.89 55.26 34.19 C 54.21 33.14 53.38 32.14 52.63 30.85 C 52.36 30.56 52.07 30.29 51.78 30 C 50.88 29.02 50.03 28.02 49.24 26.95 C 48.97 26.66 48.68 26.39 48.39 26.1 C 47.71 25.25 47.71 25.25 47.71 24.92 C 47.49 24.8 47.27 24.69 47.03 24.58 C 46.57 23.73 46.12 22.88 45.68 22.03 C 44.62 20.32 43.32 18.78 42.05 17.22 C 41.5 16.52 41.04 15.82 40.59 15.08 C 40.37 14.79 40.15 14.52 39.91 14.23 C 39.77 13.98 39.62 13.7 39.48 13.43 C 38.92 12.47 38.65 12.36 37.53 12.36 C 36.86 13.04 36.86 13.04 36.45 13.87 C 36.01 14.74 36.01 14.74 35.16 15.76 C 34.99 16.04 34.8 16.32 34.63 16.62 C 33.97 17.62 33.97 17.62 33.06 18.69 C 32.12 19.81 31.34 20.96 30.58 22.2 C 30.43 22.46 30.26 22.71 30.09 22.96 C 29.78 23.49 29.49 24.03 29.22 24.58 C 28.83 25.03 28.44 25.49 28.04 25.93 C 27.85 26.14 27.68 26.36 27.49 26.58 C 27.12 27 26.73 27.41 26.34 27.8 C 25.93 28.31 25.54 28.82 25.15 29.32 C 24.69 29.88 24.25 30.46 23.8 31.02 C 23.12 31.87 23.12 31.87 22.63 32.63 C 22.1 33.4 22.1 33.4 21.08 34.24 C 20.74 34.63 20.4 35.02 20.06 35.43 C 19.84 35.65 19.62 35.87 19.39 36.11 C 18.55 37.04 17.77 38.01 17.01 38.99 C 16.49 39.62 15.96 40.26 15.42 40.89 C 14.69 41.81 14.06 42.74 13.45 43.74 C 13.28 43.96 13.11 44.18 12.94 44.42 C 12.72 44.86 12.5 45.32 12.26 45.78 C 11.92 46.23 11.58 46.68 11.24 47.13 C 10.96 47.64 10.69 48.15 10.4 48.66 C 10.11 49.05 9.84 49.44 9.55 49.85 C 9.26 50.64 8.97 51.42 8.7 52.22 C 8.57 52.48 8.43 52.75 8.29 53 C 7.8 54.04 7.51 55.05 7.21 56.16 C 7.12 56.53 7.02 56.92 6.92 57.31 C 5.56 62.89 6.11 69.57 8.53 74.78 C 8.6 74.95 8.6 74.95 8.96 75.81 C 9.45 76.98 9.94 78.02 10.74 79.02 C 11.08 79.53 11.41 80.04 11.75 80.55 C 13.47 83.02 15.03 85.26 17.52 86.99 C 17.81 87.21 18.08 87.43 18.37 87.67 C 18.88 88.01 19.39 88.35 19.89 88.69 C 20.28 88.96 20.68 89.25 21.08 89.54 C 21.52 89.76 21.98 89.98 22.44 90.21 C 22.73 90.43 23 90.65 23.29 90.89 C 24.19 91.23 25.1 91.57 26 91.91 C 26.44 92.13 26.9 92.35 27.36 92.59 C 30.5 93.45 33.6 93.98 36.86 94.11 C 37.21 94.13 37.58 94.15 37.96 94.17 C 41.66 94 45.45 93.49 48.9 92.08 C 50.56 91.42 50.56 91.42 51.37 91.16 C 52.22 90.86 52.76 90.43 53.48 89.87 C 54.04 89.54 54.61 89.2 55.17 88.86 C 55.44 88.64 55.73 88.42 56.02 88.18 C 56.65 87.77 57.26 87.38 57.89 86.99 C 58.8 86.41 59.5 85.89 60.26 85.13 C 60.6 84.85 60.94 84.57 61.28 84.28 C 61.69 83.67 62.08 83.04 62.47 82.41 C 62.81 81.9 63.14 81.39 63.48 80.89 C 63.7 80.55 63.92 80.21 64.16 79.87 C 64.43 79.53 64.72 79.19 65.01 78.85 C 68.59 72.88 68.49 65.74 65.76 59.48 C 64.74 57.67 63.57 56.28 61.96 54.94 C 61.74 54.66 61.52 54.38 61.28 54.09 C 60.94 53.87 60.6 53.65 60.26 53.41 C 59.99 53.19 59.7 52.97 59.41 52.73 C 58.63 52.37 57.84 52.04 57.04 51.71 C 56.8 51.59 56.56 51.48 56.33 51.34 C 52.54 49.92 48.24 50.25 44.83 52.39 C 44.59 52.53 44.35 52.66 44.11 52.82 C 43.11 53.48 42.28 54.26 41.43 55.11 C 41.33 55.19 41.33 55.19 40.77 55.63 C 37.11 59.07 37.52 64.15 38.03 68.74 C 38.77 71.49 40.62 73.22 42.62 75.12 C 42.84 75.34 43.06 75.56 43.3 75.8 C 43.42 75.88 43.42 75.88 44.01 76.29 C 44.66 76.81 44.66 76.81 44.83 77.66 C 44.49 78.85 44.23 79.16 43.47 80.04 C 43.18 80.6 42.89 81.16 42.62 81.73 C 42.28 82.29 41.94 82.87 41.6 83.43 C 41.47 83.72 41.32 84.01 41.16 84.29 C 40.76 85.13 40.76 85.13 40.32 85.82 C 39.91 86.48 39.91 86.48 39.55 87.31 C 39.23 88.01 39.23 88.01 38.72 88.35 C 37.26 88.35 36.99 87.99 36.23 86.79 C 35.57 85.84 34.8 85.09 33.97 84.28 C 33.8 84.07 33.62 83.87 33.45 83.65 C 32.63 82.72 31.68 81.97 30.72 81.21 C 29.9 80.55 29.9 80.55 29.05 79.7 C 28.54 79.46 28.04 79.24 27.53 79.02 C 27.02 78.68 26.51 78.34 26 78 C 25.78 77.87 25.56 77.73 25.32 77.59 C 24.19 76.87 23.22 76.07 22.27 75.12 C 22.05 74.95 21.83 74.78 21.59 74.61 C 20.91 74.1 20.91 74.1 20.06 73.25 C 18.2 71.52 18.2 71.52 17.28 70.78 C 16.6 70.13 16.15 69.47 15.65 68.67 C 15.45 68.44 15.25 68.2 15.04 67.94 C 12.84 64.28 12.92 59.02 14.54 55.14 C 15.33 53.85 16.16 52.68 17.18 51.54 C 17.47 51.2 17.74 50.86 18.03 50.53 C 19.27 49.41 20.39 48.74 21.93 48.15 C 22.27 47.93 22.61 47.71 22.95 47.47 C 23.59 47.27 24.24 47.1 24.88 46.93 C 25.22 46.85 25.56 46.76 25.92 46.68 C 30.04 45.73 34.82 46.62 37.87 49.68 C 38.09 49.95 38.31 50.24 38.55 50.53 C 40.32 50.53 40.32 50.53 41.27 49.34 C 41.94 49.02 41.94 49.02 42.76 48.73 C 43.78 48.35 44.69 47.96 45.68 47.47 C 46.3 47.3 46.93 47.15 47.57 47.01 C 47.73 46.98 47.73 46.98 48.56 46.81 C 52.83 45.91 57.43 46.56 61.28 48.66 C 61.72 48.88 62.18 49.1 62.64 49.34 C 63.09 49.78 63.55 50.24 63.99 50.7 C 64.2 50.88 64.42 51.05 64.64 51.24 C 65.18 51.71 65.18 51.71 65.86 52.56 C 66.13 52.83 66.42 53.12 66.71 53.41 C 67.55 54.66 68.25 55.95 68.91 57.31 C 69.05 57.56 69.18 57.84 69.32 58.11 C 69.89 59.51 70.18 60.92 70.47 62.42 C 70.52 62.7 70.59 62.99 70.64 63.28 C 71.35 66.81 71.85 70.18 70.84 73.73 C 70.49 75.32 70.51 76.88 70.78 78.51 C 70.32 79.14 69.88 79.75 69.42 80.38 C 69.05 81.16 68.71 81.94 68.39 82.75 C 68.06 83.43 68.06 83.43 67.38 84.28 C 67.27 84.51 67.13 84.75 67.01 84.99 C 66.28 86.23 65.33 87.18 64.33 88.18 C 64.13 88.43 63.92 88.69 63.72 88.96 C 61.65 91.52 59.43 93.69 56.36 94.96 C 55.17 95.47 55.17 95.47 54.48 95.96 C 53.49 96.59 52.53 96.95 51.44 97.34 C 51.15 97.46 50.86 97.57 50.58 97.69 C 49.69 97.98 48.85 98.17 47.95 98.35 C 45.32 98.88 45.32 98.88 44.32 99.88 C 42.66 99.98 40.98 99.98 39.3 99.98 C 38.47 99.98 37.62 99.98 36.79 100 C 36.26 100 35.72 100 35.19 100 C 34.7 100 34.23 100 33.72 100 C 32.41 99.88 31.82 99.61 30.75 98.86 C 29.97 98.64 29.19 98.46 28.41 98.29 C 25.47 97.63 22.93 96.79 20.4 95.13 C 20.08 95.03 19.76 94.91 19.42 94.81 C 17.59 94.2 16.03 93.23 14.64 91.91 C 14.47 91.76 14.47 91.76 13.64 90.99 C 12.42 89.87 11.21 88.72 10.02 87.55 C 9.82 87.36 9.62 87.16 9.41 86.97 C 7.39 84.99 6.21 82.82 5.14 80.21 C 5.05 80.09 5.05 80.09 4.66 79.51 C 3.19 77.27 2.34 74.8 1.58 72.24 C 1.49 72 1.41 71.78 1.32 71.54 C 0.98 70.44 0.85 69.34 0.71 68.2 C 0.64 67.76 0.59 67.33 0.54 66.88 C 0.03 62.53 0 58.11 1.41 53.92 C 1.49 53.68 1.58 53.43 1.65 53.19 C 2.36 51.14 3.24 49.36 4.46 47.57 C 4.99 46.78 5.39 45.96 5.82 45.1 C 6.72 43.37 7.9 41.96 9.21 40.52 C 9.85 39.79 10.46 39.06 11.08 38.31 C 11.69 37.57 12.3 36.84 12.94 36.11 C 13.2 35.8 13.43 35.5 13.69 35.18 C 14.37 34.36 15.08 33.63 15.82 32.89 C 16.66 31.95 17.44 30.99 18.2 30 C 19.08 28.92 19.98 27.83 20.91 26.78 C 21.85 25.7 22.61 24.64 23.29 23.39 C 23.63 22.93 23.97 22.47 24.3 22.03 C 24.47 21.79 24.66 21.56 24.83 21.32 C 25.22 20.81 25.61 20.32 26 19.83 C 26.17 19.61 26.34 19.39 26.51 19.15 C 26.9 18.64 27.29 18.13 27.7 17.62 C 28.71 16.25 29.43 14.96 30.07 13.38 C 30.77 12.16 31.55 11.01 32.33 9.84 C 32.84 9.07 33.23 8.28 33.63 7.45 C 33.85 7.06 34.07 6.67 34.31 6.26 C 34.48 5.92 34.63 5.6 34.8 5.26 C 35.33 4.22 35.33 4.22 35.77 3.54 C 36.18 2.87 36.18 2.87 36.53 1.8 C 37.04 0.31 37.6 0 39.06 0.49Z M 20.4 54.26 C 20.23 54.48 20.08 54.72 19.91 54.95 C 17.69 58.53 17.25 62.11 19.27 65.89 C 19.79 66.74 20.35 67.47 21.08 68.16 C 22.24 69.47 22.24 69.47 22.74 70.13 C 23.46 70.88 24.25 71.25 25.15 71.73 C 25.56 72.05 25.95 72.39 26.34 72.74 C 26.51 72.86 26.51 72.86 27.36 73.42 C 27.76 73.76 28.15 74.1 28.54 74.44 C 28.71 74.58 28.71 74.58 29.56 75.29 C 29.78 75.56 30 75.85 30.24 76.14 C 30.41 76.27 30.41 76.27 31.26 76.98 C 31.55 77.26 31.82 77.54 32.11 77.83 C 32.8 78.46 33.5 79.04 34.23 79.6 C 35.41 80.55 36.31 81.51 37.19 82.75 C 37.53 82.92 37.53 82.92 38.55 82.92 C 39.4 81.9 39.4 81.9 39.81 81.16 C 40.25 80.38 40.25 80.38 40.89 79.7 C 41.43 79.02 41.43 79.02 41.43 77.49 C 40.86 76.87 40.26 76.49 39.54 76.05 C 37.87 74.83 36.64 73.1 35.5 71.39 C 35.36 71.18 35.21 70.98 35.06 70.76 C 32.48 66.2 32.9 61.43 34.99 56.8 C 35.69 55.82 35.69 55.82 36.35 55.11 C 37.55 53.71 37.55 53.71 37.36 52.39 C 36.43 51.27 35.43 50.68 34.14 50.02 C 33.8 49.8 33.46 49.58 33.12 49.34 C 27.88 48.34 23.3 49.58 20.4 54.26Z';

export function BrandMark({ size = 30, tone = 'white', className = '' }) {
  const fill = tone === 'white' ? '#FFFFFF' : tone === 'ink' ? '#0A0B0D' : 'var(--accent)';
  const height = size;
  const width = size * (76.02 / 100);
  return <svg
    className={`brand-mark ${className}`.trim()}
    width={width.toFixed(2)}
    height={height}
    viewBox={BRAND_VIEWBOX}
    aria-hidden="true"
    focusable="false"
  >
    <path d={BRAND_MARK} fill={fill} fillRule="evenodd" />
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

export function SectionHeading({ eyebrow, title, action, className = '' }) {
  return (
    <div className={`section-heading ${className}`}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
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

export function Field({ label, hint, children, className = '' }) {
  return <label className={`field ${className}`}>
    <span className="field-label">{label}</span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
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
  const palette = dark
    ? {
        background: '#0F1115',
        blocks: '#161920',
        blockStroke: '#1D212B',
        road: '#1E222C',
        roadEdge: '#282D38',
        routeBase: '#2E3442',
        routeHalo: '#FF3B42',
        route: '#FF3B42',
        start: '#FFFFFF',
        startRing: '#0F1115',
        end: '#D42127',
        vehicle: '#FFFFFF',
        vehicleStroke: '#0A0B0D',
        label: '#181B22',
        labelText: '#F3F4F6',
        streetLabel: '#555D6E',
        park: '#141A18',
      }
    : {
        background: '#F3F4F6',
        blocks: '#E8EAEE',
        blockStroke: '#DCE0E6',
        road: '#FFFFFF',
        roadEdge: '#D1D5DB',
        routeBase: '#9CA3AF',
        routeHalo: '#D42127',
        route: '#D42127',
        start: '#FFFFFF',
        startRing: '#0A0B0D',
        end: '#D42127',
        vehicle: '#0A0B0D',
        vehicleStroke: '#FFFFFF',
        label: '#FFFFFF',
        labelText: '#0A0B0D',
        streetLabel: '#6B7280',
        park: '#E2E9E4',
      };
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
        <svg viewBox="0 0 440 205" role="img" aria-label={`Route from ${from} to ${to}`} preserveAspectRatio="xMidYMid slice">
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
