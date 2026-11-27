import React, { useId } from 'react';
import { ArrowRight } from 'lucide-react';
import { BRAND_ARTWORK, COLORS } from './tokens.js';

/**
 * Button — Canonical SANBS RIDE pill action primitive matching design.css (.button*).
 * Variants: primary (crimson), carbon (dark), secondary (white), quiet (neutral fill), danger.
 * Sizes: small, md (default), large.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  wide = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const variantMap = {
    primary: 'button-primary',
    dark: 'button-carbon',
    carbon: 'button-carbon',
    secondary: 'button-secondary',
    soft: 'button-quiet',
    quiet: 'button-quiet',
    ghost: 'button-quiet',
    danger: 'button-danger',
  };
  const variantClass = variantMap[variant] || 'button-primary';
  const sizeClass = size === 'sm' || size === 'small' ? 'button-small' : size === 'lg' ? 'ds-btn-lg' : '';
  const wideClass = wide ? 'button-wide' : '';
  const classes = ['button', variantClass, sizeClass, wideClass, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

/**
 * Kicker — Uppercase JetBrains Mono micro eyebrow label (.eyebrow).
 */
export function Kicker({ tone = 'default', className = '', children, ...props }) {
  const toneClass = tone === 'accent' ? 'kicker--accent' : tone === 'dark' ? 'kicker--dark' : '';
  return (
    <span className={['eyebrow', toneClass, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </span>
  );
}

/**
 * SurfaceCard — Architectural container adhering to SANBS neutral / carbon surface tiers.
 * tones: paper | paper-2 | paper-4 | carbon | ghost-accent
 */
export function SurfaceCard({
  as: Component = 'div',
  tone = 'paper',
  radius = 'lg',
  padding = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = [
    'ds-surface-card',
    `ds-surface-card--${tone}`,
    `ds-surface-card--r-${radius}`,
    `ds-surface-card--p-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

/**
 * TelemetryStrip — Signature 3-column dark carbon telemetry readout with optional crimson fill bar.
 */
export function TelemetryStrip({ items = [], progress = null, className = '' }) {
  return (
    <div className={['ds-telemetry', className].filter(Boolean).join(' ')}>
      <div className="ds-telemetry__grid">
        {items.map((item) => (
          <div key={item.label} className="ds-telemetry__cell">
            <span className="ds-telemetry__label">{item.label}</span>
            <strong className={`ds-telemetry__value ${item.accent ? 'is-accent' : ''}`}>
              {item.value}
            </strong>
          </div>
        ))}
      </div>
      {typeof progress === 'number' && (
        <div
          className="ds-telemetry__track"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className="ds-telemetry__fill"
            style={{ width: `${Math.max(4, Math.min(100, Math.round(progress * 100)))}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * RouteStopStack — Origin-to-destination route summary card with vertical hairline connector.
 */
export function RouteStopStack({
  originLabel = 'Pickup',
  originTitle,
  originMeta,
  destLabel = 'SANBS Centre',
  destTitle,
  destMeta,
  className = '',
}) {
  return (
    <div className={['ds-route-stack', className].filter(Boolean).join(' ')}>
      <div className="ds-route-stop">
        <span className="ds-route-dot ds-route-dot--origin" aria-hidden="true" />
        <div className="ds-route-copy">
          <span className="ds-route-kicker">{originLabel}</span>
          <strong className="ds-route-title">{originTitle}</strong>
          {originMeta && <span className="ds-route-meta">{originMeta}</span>}
        </div>
      </div>
      <div className="ds-route-connector" aria-hidden="true" />
      <div className="ds-route-stop">
        <span className="ds-route-dot ds-route-dot--dest" aria-hidden="true" />
        <div className="ds-route-copy">
          <span className="ds-route-kicker">{destLabel}</span>
          <strong className="ds-route-title">{destTitle}</strong>
          {destMeta && <span className="ds-route-meta">{destMeta}</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * SplitCtaBanner — Signature crimson CTA banner (.donor-cta-banner) with nested #0A0B0D arrow disc.
 */
export function SplitCtaBanner({
  kicker,
  title,
  onClick,
  icon = null,
  compact = false,
  className = '',
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={['donor-cta-banner', compact ? 'is-compact' : '', className].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="donor-cta-copy">
        <strong>{title}</strong>
        {kicker && <small>{kicker}</small>}
      </span>
      <span className="donor-cta-disc" aria-hidden="true">
        {icon || <ArrowRight size={18} strokeWidth={2.2} />}
      </span>
    </button>
  );
}

/**
 * CircularDock — Floating 4-button 52px circular bottom navigation bar (.donor-circular-dock).
 */
export function CircularDock({ items = [], activeId, onChange, ariaLabel = 'Primary navigation', className = '' }) {
  return (
    <nav
      className={['mobile-bottom-nav', 'donor-circular-dock', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            className={`dock-circle-btn ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange?.(item.id)}
          >
            <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}

/**
 * SanbsDropPin — Liquid-filled SANBS destination drop marker (consistent with JourneyMap).
 */
export function SanbsDropPin({ fillPercent = 72, size = 44, label = 'SANBS destination pin' }) {
  const uid = useId().replace(/:/g, '');
  const clamped = Math.max(0, Math.min(100, Number(fillPercent) || 0));
  const liquidTop = 27 - (24 * clamped) / 100;
  const liquidHeight = 27 - liquidTop + 2;

  return (
    <svg
      width={size}
      height={Math.round((size * 28) / 24)}
      viewBox="0 0 24 28"
      role="img"
      aria-label={`${label} (${Math.round(clamped)}% complete)`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`ds-drop-${uid}`}>
          <path d={BRAND_ARTWORK.dropPath} />
        </clipPath>
      </defs>
      <path d={BRAND_ARTWORK.dropPath} fill={COLORS.ink2} />
      <g clipPath={`url(#ds-drop-${uid})`}>
        <rect
          x="-2"
          y={liquidTop.toFixed(2)}
          width="28"
          height={liquidHeight.toFixed(2)}
          fill={COLORS.accent}
        />
      </g>
      <path
        d={BRAND_ARTWORK.dropPath}
        fill="none"
        stroke={COLORS.white}
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * EcgPulseLine — Vector heartbeat trace used in brand splash & telemetry accents.
 */
export function EcgPulseLine({ stroke = COLORS.accentBright, width = 180, height = 28, animate = false }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 28"
      fill="none"
      aria-hidden="true"
      className={animate ? 'ds-ecg-animated' : ''}
    >
      <path
        d={BRAND_ARTWORK.ecgPath}
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * ChoiceOption — Accessible selectable radio/check row primitive.
 */
export function ChoiceOption({
  selected = false,
  title,
  description,
  trailing,
  onClick,
  className = '',
  name,
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      name={name}
      className={['ds-choice', selected ? 'is-selected' : '', className].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <span className="ds-choice__indicator" aria-hidden="true">
        {selected ? <span className="ds-choice__dot" /> : null}
      </span>
      <span className="ds-choice__body">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      {trailing && <span className="ds-choice__trailing">{trailing}</span>}
    </button>
  );
}
