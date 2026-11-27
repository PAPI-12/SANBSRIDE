import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Car,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Compass,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Heart,
  History,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LocateFixed,
  MapPin,
  MessageSquare,
  Moon,
  Navigation,
  Palette,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Truck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import {
  ACCESSIBILITY_RULES,
  AVATAR_TONES,
  BRAND_ARTWORK,
  COLORS,
  CONTRAST_PAIRS,
  DESIGN_SYSTEM_META,
  MAP_PALETTE,
  RADII,
  SPACING,
  STATUS_CHIP_SPECS,
  STUDIO_MEDIA,
  TYPOGRAPHY,
  contrastRatio,
} from './tokens.js';
import {
  Button,
  EcgPulseLine,
  Kicker,
  RouteStopStack,
  SanbsDropPin,
  SplitCtaBanner,
  TelemetryStrip,
} from './primitives.jsx';
import {
  BrandMark,
  DriverAvatar,
  JourneyTimeline,
  ModalFrame,
  OriginTag,
  RouteMap,
  SanbsBrand,
  StatusChip,
} from '../components/Shared.jsx';
import { STATUS_META } from '../domain.js';

const SECTIONS = [
  { id: 'uikit', label: '01 · UI Kit Sheet', icon: Palette },
  { id: 'devices', label: '02 · Tablet & Mobile', icon: Smartphone },
  { id: 'imagery', label: '03 · Imagery & Maps', icon: Compass },
  { id: 'icons', label: '04 · Icon Studio', icon: Sparkles },
  { id: 'states', label: '05 · Ride Lifecycle', icon: CarFront },
];

const PRIMARY_CIRCLES = [
  { name: 'Carbon Frame', hex: COLORS.carbon, cssVar: '--carbon', text: COLORS.white },
  { name: 'SANBS Crimson', hex: COLORS.accent, cssVar: '--accent', text: COLORS.white },
];

const PRIMARY_SHADES = [
  { name: 'Carbon 2', hex: COLORS.carbon2, cssVar: '--carbon-2', text: COLORS.white },
  { name: 'Ink Muted', hex: COLORS.muted, cssVar: '--muted', text: COLORS.white },
  { name: 'Crimson Dark', hex: COLORS.accentDark, cssVar: '--accent-dark', text: COLORS.white },
  { name: 'Crimson Soft', hex: COLORS.accentSoft, cssVar: '--accent-soft', text: COLORS.accentDeep },
];

const SECONDARY_CIRCLES = [
  { name: 'Stealth Void', hex: COLORS.stealthBg, cssVar: '--stealth-bg', text: COLORS.white },
  { name: 'Ready Green', hex: COLORS.ok, cssVar: '--ok', text: COLORS.white },
];

const SECONDARY_SHADES = [
  { name: 'Pure Paper', hex: COLORS.paper, cssVar: '--paper', text: COLORS.ink, border: true },
  { name: 'Cool Stage', hex: COLORS.canvas, cssVar: '--canvas', text: COLORS.ink, border: true },
  { name: 'Dispatch Blue', hex: COLORS.infoSoft, cssVar: '--info-soft', text: COLORS.info },
  { name: 'Transit Violet', hex: COLORS.violetSoft, cssVar: '--violet-soft', text: COLORS.violet },
];

const ICON_GALLERY = [
  { name: 'Navigation', category: 'Mobility', Icon: Navigation, usage: 'Live turn HUD' },
  { name: 'MapPin', category: 'Mobility', Icon: MapPin, usage: 'Pickup & centre pin' },
  { name: 'Compass', category: 'Mobility', Icon: Compass, usage: 'Route bearing' },
  { name: 'LocateFixed', category: 'Mobility', Icon: LocateFixed, usage: 'Recenter GPS' },
  { name: 'Car', category: 'Mobility', Icon: Car, usage: 'Assigned sedan' },
  { name: 'CarFront', category: 'Mobility', Icon: CarFront, usage: 'Active transit' },
  { name: 'Truck', category: 'Mobility', Icon: Truck, usage: 'Fleet dispatch' },
  { name: 'ArrowRight', category: 'Mobility', Icon: ArrowRight, usage: 'Primary CTA' },
  { name: 'ArrowLeft', category: 'Mobility', Icon: ArrowLeft, usage: 'Back header' },
  { name: 'Heart', category: 'Donor Care', Icon: Heart, usage: 'Donor role' },
  { name: 'ShieldCheck', category: 'Donor Care', Icon: ShieldCheck, usage: 'POPIA guard' },
  { name: 'LifeBuoy', category: 'Donor Care', Icon: LifeBuoy, usage: 'Staff support' },
  { name: 'UserRound', category: 'Donor Care', Icon: UserRound, usage: 'Profile tab' },
  { name: 'UsersRound', category: 'Donor Care', Icon: UsersRound, usage: 'Fleet cohorts' },
  { name: 'Phone', category: 'Donor Care', Icon: Phone, usage: 'Call contact' },
  { name: 'MessageSquare', category: 'Donor Care', Icon: MessageSquare, usage: 'Pickup note' },
  { name: 'Home', category: 'Donor Care', Icon: Home, usage: 'Home tab' },
  { name: 'History', category: 'Donor Care', Icon: History, usage: 'Trip log tab' },
  { name: 'Activity', category: 'Telemetry', Icon: Activity, usage: 'Live ECG' },
  { name: 'BarChart3', category: 'Telemetry', Icon: BarChart3, usage: 'Driver stats' },
  { name: 'Clock3', category: 'Telemetry', Icon: Clock3, usage: 'ETA readout' },
  { name: 'LayoutDashboard', category: 'Telemetry', Icon: LayoutDashboard, usage: 'Ops console' },
  { name: 'ClipboardList', category: 'Telemetry', Icon: ClipboardList, usage: 'Arrival board' },
  { name: 'FileText', category: 'Telemetry', Icon: FileText, usage: 'Trip receipt' },
  { name: 'Download', category: 'Telemetry', Icon: Download, usage: 'Export CSV' },
  { name: 'Sliders', category: 'Telemetry', Icon: Sliders, usage: 'Filter bar' },
  { name: 'Settings2', category: 'Telemetry', Icon: Settings2, usage: 'Model setup' },
  { name: 'CheckCircle2', category: 'Alerts', Icon: CheckCircle2, usage: 'Completed' },
  { name: 'AlertTriangle', category: 'Alerts', Icon: AlertTriangle, usage: 'Exception' },
  { name: 'AlertCircle', category: 'Alerts', Icon: AlertCircle, usage: 'Field error' },
  { name: 'Bell', category: 'Alerts', Icon: Bell, usage: 'Updates' },
  { name: 'Search', category: 'Alerts', Icon: Search, usage: 'Find address' },
  { name: 'Plus', category: 'Alerts', Icon: Plus, usage: 'New booking' },
  { name: 'Check', category: 'Alerts', Icon: Check, usage: 'Confirmed' },
  { name: 'RotateCcw', category: 'Alerts', Icon: RotateCcw, usage: 'Reset demo' },
  { name: 'Eye', category: 'Alerts', Icon: Eye, usage: 'Show secret' },
  { name: 'EyeOff', category: 'Alerts', Icon: EyeOff, usage: 'Hide secret' },
  { name: 'ChevronRight', category: 'Alerts', Icon: ChevronRight, usage: 'Open detail' },
  { name: 'ChevronDown', category: 'Alerts', Icon: ChevronDown, usage: 'Workspace menu' },
  { name: 'Sun', category: 'Alerts', Icon: Sun, usage: 'Daylight paper' },
  { name: 'Moon', category: 'Alerts', Icon: Moon, usage: 'Stealth dark' },
  { name: 'X', category: 'Alerts', Icon: X, usage: 'Close overlay' },
];

const DOCK_DEMO_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'Live Journey', icon: Navigation },
  { id: 'trips', label: 'Trips', icon: History },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

function MiniStatusBar({ dark = false }) {
  const color = dark ? COLORS.white : COLORS.ink;
  return (
    <div className="ds-ios-status" style={{ color }}>
      <span>9:41</span>
      <span className="ds-ios-icons" aria-hidden="true">
        <svg width="15" height="10" viewBox="0 0 15 10" fill={color}>
          <rect x="0" y="6" width="2.4" height="4" rx="0.6" />
          <rect x="4" y="4" width="2.4" height="6" rx="0.6" />
          <rect x="8" y="2" width="2.4" height="8" rx="0.6" />
          <rect x="12" y="0" width="2.4" height="10" rx="0.6" />
        </svg>
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
          <rect x="0.6" y="0.6" width="16.8" height="8.8" rx="2.2" stroke={color} strokeWidth="1.1" />
          <rect x="2.2" y="2.2" width="12.5" height="5.6" rx="1" fill={color} />
          <rect x="18.3" y="3.2" width="1.5" height="3.6" rx="0.7" fill={color} />
        </svg>
      </span>
    </div>
  );
}

function CircularSealStamp({ text = 'SANBS RIDE · DONOR MOBILITY ·', tone = 'crimson', size = 66 }) {
  const rawId = React.useId();
  const pathId = `seal-arc-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const bg = tone === 'crimson' ? COLORS.accent : COLORS.carbon;
  const fg = COLORS.white;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className="ds-seal-stamp"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="39" fill={bg} />
      <circle cx="40" cy="40" r="24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <defs>
        <path id={pathId} d="M 40,40 m -29,0 a 29,29 0 1,1 58,0 a 29,29 0 1,1 -58,0" />
      </defs>
      <text
        fill={fg}
        fontSize="7.4"
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="1.6"
      >
        <textPath href={`#${pathId}`}>{text}</textPath>
      </text>
      <path d="M40 31v18M31 40h18" stroke={fg} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export default function DesignSystemView({ onNotify }) {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('uikit');
  const [reduceMotionDemo, setReduceMotionDemo] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // Poster UI Kit Interactive States
  const [sampleCopy, setSampleCopy] = useState('Zero-cost donor transport across Gauteng.');
  const [dockTab, setDockTab] = useState('home');
  const [toggleReturn, setToggleReturn] = useState(true);
  const [toggleStealth, setToggleStealth] = useState(true);
  const [fieldText, setFieldText] = useState('14 Cradock Ave, Rosebank');
  const [showPassDemo, setShowPassDemo] = useState(false);

  // Device Showcase Interactive States
  const [phoneScreen, setPhoneScreen] = useState('home');

  // Imagery, Drop & Maps States
  const [dropFill, setDropFill] = useState(74);
  const [splashKey, setSplashKey] = useState(0);
  const [mapTheme, setMapTheme] = useState('stealth');
  const [mapProgress, setMapProgress] = useState(0.62);
  const [mapLeg, setMapLeg] = useState('outbound');

  // Icon Studio States
  const [iconCategory, setIconCategory] = useState('All');
  const [iconStroke, setIconStroke] = useState(2);
  const [iconBadgeStyle, setIconBadgeStyle] = useState('carbon');

  // Lifecycle & Modal States
  const [selectedStatus, setSelectedStatus] = useState('driver_on_the_way');
  const [legFilter, setLegFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const query = search.trim().toLowerCase();

  const copyToken = async (text, label) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(label);
      onNotify?.(`Copied ${text}`);
      window.setTimeout(() => setCopiedId((prev) => (prev === label ? '' : prev)), 1400);
    } catch {
      onNotify?.(`Token: ${text}`);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`ds-sec-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: reduceMotionDemo ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const filteredIcons = useMemo(() => {
    return ICON_GALLERY.filter((item) => {
      const catMatch = iconCategory === 'All' || item.category === iconCategory;
      const qMatch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.usage.toLowerCase().includes(query);
      return catMatch && qMatch;
    });
  }, [iconCategory, query]);

  const filteredStatuses = useMemo(() => {
    return STATUS_CHIP_SPECS.filter((item) => {
      const legMatch = legFilter === 'All' || item.leg === legFilter;
      const searchMatch =
        !query ||
        item.key.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.tone.toLowerCase().includes(query);
      return legMatch && searchMatch;
    });
  }, [legFilter, query]);

  const activeStatusMeta = STATUS_META[selectedStatus] || STATUS_META.driver_on_the_way;
  const isReturnLeg =
    selectedStatus.startsWith('return') ||
    selectedStatus === 'donor_on_the_way_home' ||
    selectedStatus === 'completed';

  const previewBooking = useMemo(
    () => ({
      id: 'SR-261127-008',
      status: selectedStatus,
      returnRequested: true,
      outboundLeg: { status: isReturnLeg ? 'arrived_at_site' : selectedStatus },
      returnLeg: {
        status: selectedStatus.startsWith('return_')
          ? selectedStatus.replace('return_', '')
          : selectedStatus === 'donor_on_the_way_home' || selectedStatus === 'completed'
          ? selectedStatus
          : 'waiting_authorisation',
      },
      createdAt: '2026-11-27T08:40:00Z',
    }),
    [selectedStatus, isReturnLeg]
  );

  return (
    <div className={`ds-sheet-page ${reduceMotionDemo ? 'ds-reduce-motion' : ''}`}>
      {/* Quiet Floating Section & Utility Bar */}
      <div className="ds-float-nav-wrap">
        <div className="ds-float-nav">
          <div className="ds-float-nav__tabs" role="navigation" aria-label="Design system sections">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  className={`ds-float-tab ${activeSection === sec.id ? 'is-active' : ''}`}
                  onClick={() => scrollToSection(sec.id)}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          <div className="ds-float-nav__tools">
            <label className="ds-float-search" aria-label="Filter design system">
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hex, icon, token..."
              />
            </label>
            <button
              type="button"
              className={`ds-float-pill ${reduceMotionDemo ? 'is-active' : ''}`}
              aria-pressed={reduceMotionDemo}
              onClick={() => setReduceMotionDemo((v) => !v)}
            >
              <Eye size={13} aria-hidden="true" />
              <span>{reduceMotionDemo ? 'Reduced' : 'Motion'}</span>
            </button>
            <button
              type="button"
              className="ds-float-pill"
              onClick={() =>
                copyToken(
                  JSON.stringify({ meta: DESIGN_SYSTEM_META, colors: COLORS, typography: TYPOGRAPHY }, null, 2),
                  'json-export'
                )
              }
            >
              {copiedId === 'json-export' ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedId === 'json-export' ? 'Copied' : 'JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          BOARD 01 — SWISS EDITORIAL "UI KIT." SPEC SHEET (REFERENCE 1 LAYOUT)
         ==================================================================== */}
      <section id="ds-sec-uikit" className="ds-poster-sheet">
        <header className="ds-poster-hero">
          <span className="ds-poster-eyebrow">SANBS RIDE · MONOCHROME + CRIMSON · v{DESIGN_SYSTEM_META.version}</span>
          <h1>UI Kit.</h1>
          <p>Style guidelines, color circles, interactive controls, and illustration system for SANBS RIDE.</p>
          <span className="ds-poster-rule" aria-hidden="true" />
        </header>

        <div className="ds-uikit-grid">
          {/* LEFT POSTER COLUMN: Text styles · Circular Color Palette · Text fields & Toggles */}
          <div className="ds-uikit-col">
            {/* TEXT STYLES */}
            <div className="ds-kit-block">
              <div className="ds-kit-block__title">
                <h2>Text styles</h2>
                <input
                  type="text"
                  className="ds-inline-sample-input"
                  value={sampleCopy}
                  onChange={(e) => setSampleCopy(e.target.value)}
                  aria-label="Edit specimen headline text"
                />
              </div>

              <div className="ds-text-styles-2col">
                <div className="ds-text-group">
                  <span className="ds-group-label">Headlines</span>
                  <div className="ds-type-spec-item">
                    <div className="ds-spec-preview" style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em' }}>
                      Hi Thabo
                    </div>
                    <small>Manrope / ExtraBold / 30 px / 1.08 line / #0A0B0D</small>
                  </div>
                  <div className="ds-type-spec-item">
                    <div className="ds-spec-preview" style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>
                      {sampleCopy}
                    </div>
                    <small>Manrope / ExtraBold / 24 px / 1.15 line / #0A0B0D</small>
                  </div>
                  <div className="ds-type-spec-item">
                    <div className="ds-spec-preview" style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>
                      SANBS Sandton Donor Centre
                    </div>
                    <small>Manrope / Bold / 19 px / 1.18 line / #0A0B0D</small>
                  </div>
                </div>

                <div className="ds-text-group">
                  <span className="ds-group-label">Subheads &amp; Monospace</span>
                  <div className="ds-type-spec-item">
                    <div className="ds-spec-preview" style={{ fontFamily: 'var(--font)', fontSize: 15, fontWeight: 500 }}>
                      Free round-trip donor transport
                    </div>
                    <small>Inter / Medium / 15 px / 1.50 line / #0A0B0D</small>
                  </div>

                  <span className="ds-group-label" style={{ marginTop: 14 }}>Bodys &amp; Kickers</span>
                  <div className="ds-type-spec-item">
                    <div className="ds-spec-preview" style={{ fontFamily: 'var(--font)', fontSize: 13.5, color: COLORS.muted, lineHeight: 1.5 }}>
                      Your assigned vehicle stays tracked on our stealth dark route until safe return.
                    </div>
                    <small>Inter / Regular / 13 px / 1.45 line / #5A606D</small>
                  </div>
                  <div className="ds-type-spec-item">
                    <div className="ds-spec-preview" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.09em', color: COLORS.accent }}>
                      SR-261127-008 · ACTIVE LEG
                    </div>
                    <small>JetBrains Mono / Bold / 11 px / +0.09em / #D42127</small>
                  </div>
                </div>
              </div>
            </div>

            {/* CIRCULAR COLOR PALETTE */}
            <div className="ds-kit-block">
              <div className="ds-kit-block__title">
                <h2>Color palette</h2>
                <span className="status-chip tone-green status-chip-compact">
                  {CONTRAST_PAIRS.length}/{CONTRAST_PAIRS.length} WCAG 2.2 AA
                </span>
              </div>

              <div className="ds-palette-circles-layout">
                <div className="ds-circle-pair-col">
                  <span className="ds-group-label">Primary colors</span>
                  <div className="ds-big-circles-stack">
                    {PRIMARY_CIRCLES.map((c) => (
                      <button
                        key={c.cssVar}
                        type="button"
                        className="ds-color-circle is-lg"
                        style={{ backgroundColor: c.hex, color: c.text }}
                        onClick={() => copyToken(c.hex, c.cssVar)}
                        title={`Copy ${c.name} (${c.hex})`}
                      >
                        <strong>{c.hex}</strong>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ds-circle-shades-col">
                  <span className="ds-group-label">Shades</span>
                  <div className="ds-shades-2x2">
                    {PRIMARY_SHADES.map((c) => (
                      <button
                        key={c.cssVar}
                        type="button"
                        className="ds-color-circle is-sm"
                        style={{ backgroundColor: c.hex, color: c.text }}
                        onClick={() => copyToken(c.hex, c.cssVar)}
                        title={`Copy ${c.name} (${c.hex})`}
                      >
                        <strong>{c.hex}</strong>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ds-palette-circles-layout" style={{ marginTop: 22 }}>
                <div className="ds-circle-pair-col">
                  <span className="ds-group-label">Secondary &amp; Stealth</span>
                  <div className="ds-big-circles-stack">
                    {SECONDARY_CIRCLES.map((c) => (
                      <button
                        key={c.cssVar}
                        type="button"
                        className="ds-color-circle is-lg"
                        style={{ backgroundColor: c.hex, color: c.text }}
                        onClick={() => copyToken(c.hex, c.cssVar)}
                        title={`Copy ${c.name} (${c.hex})`}
                      >
                        <strong>{c.hex}</strong>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ds-circle-shades-col">
                  <span className="ds-group-label">Surface &amp; Status Tints</span>
                  <div className="ds-shades-2x2">
                    {SECONDARY_SHADES.map((c) => (
                      <button
                        key={c.cssVar}
                        type="button"
                        className="ds-color-circle is-sm"
                        style={{
                          backgroundColor: c.hex,
                          color: c.text,
                          border: c.border ? `1px solid ${COLORS.line2}` : 'none',
                        }}
                        onClick={() => copyToken(c.hex, c.cssVar)}
                        title={`Copy ${c.name} (${c.hex})`}
                      >
                        <strong>{c.hex}</strong>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compact Contrast Proof Pills */}
              <div className="ds-contrast-strip">
                {CONTRAST_PAIRS.slice(0, 6).map((pair) => {
                  const ratio = contrastRatio(pair.fg, pair.bg);
                  return (
                    <span
                      key={pair.id}
                      className="ds-contrast-pill"
                      style={{ backgroundColor: pair.bg, color: pair.fg }}
                    >
                      {pair.label.split(' on ')[0]} · {ratio.toFixed(1)}:1
                    </span>
                  );
                })}
              </div>
            </div>

            {/* TEXT FIELDS & TOGGLES */}
            <div className="ds-kit-block">
              <div className="ds-kit-block__title">
                <h2>Text fields</h2>
              </div>

              <div className="ds-fields-2col">
                <div className="ds-fields-stack">
                  <div className="ds-field-with-icon">
                    <input
                      className="text-input"
                      value={fieldText}
                      onChange={(e) => setFieldText(e.target.value)}
                      aria-label="Sample street pickup input"
                    />
                    <MapPin size={15} className="ds-input-trail" aria-hidden="true" />
                  </div>

                  <div className="ds-field-with-icon">
                    <input
                      className="text-input"
                      type={showPassDemo ? 'text' : 'password'}
                      defaultValue="SANBS-Donor-2026"
                      aria-label="Sample password field"
                    />
                    <button
                      type="button"
                      className="ds-input-trail-btn"
                      onClick={() => setShowPassDemo((v) => !v)}
                      aria-label={showPassDemo ? 'Hide sample password' : 'Show sample password'}
                    >
                      {showPassDemo ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div className="ds-field-with-icon">
                    <input
                      className="text-input is-error-demo"
                      defaultValue=""
                      placeholder="SANBS donor centre required"
                      aria-invalid="true"
                    />
                    <AlertCircle size={15} className="ds-input-trail is-err" aria-hidden="true" />
                  </div>

                  <select className="text-input" defaultValue="sandton" aria-label="Sample donor centre select">
                    <option value="sandton">SANBS Sandton Donor Centre</option>
                    <option value="rosebank">SANBS Rosebank Donor Centre</option>
                    <option value="hatfield">SANBS Hatfield Donor Centre</option>
                  </select>
                </div>

                <div className="ds-toggles-stack">
                  <span className="ds-group-label">Preferences &amp; Toggles</span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={toggleReturn}
                    className={`ds-switch-row ${toggleReturn ? 'is-on' : ''}`}
                    onClick={() => setToggleReturn((v) => !v)}
                  >
                    <span>Auto-request return ride</span>
                    <span className="ds-switch-track">
                      <span className="ds-switch-knob" />
                    </span>
                  </button>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={toggleStealth}
                    className={`ds-switch-row ${toggleStealth ? 'is-on' : ''}`}
                    onClick={() => setToggleStealth((v) => !v)}
                  >
                    <span>Stealth dark routing</span>
                    <span className="ds-switch-track">
                      <span className="ds-switch-knob" />
                    </span>
                  </button>

                  <button
                    type="button"
                    className="ds-profile-chevron-row"
                    onClick={() => onNotify?.('Donor profile row tapped')}
                  >
                    <span>Thabo Mokoena · Profile</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT POSTER COLUMN: Navigation Bars · Tab bar (Circular Dock) · Buttons · Modals */}
          <div className="ds-uikit-col">
            {/* NAVIGATION BARS */}
            <div className="ds-kit-block">
              <div className="ds-kit-block__title">
                <h2>Navigation Bars</h2>
              </div>

              <div className="ds-navbars-grid">
                <div className="ds-mini-navbar">
                  <MiniStatusBar />
                  <div className="ds-mini-navbar__body is-center">
                    <SanbsBrand light={false} compact />
                  </div>
                </div>

                <div className="ds-mini-navbar">
                  <MiniStatusBar />
                  <div className="ds-mini-navbar__body">
                    <span className="ds-nav-back-chip"><ArrowLeft size={13} /> Back</span>
                    <strong>My Trips</strong>
                    <span className="ds-nav-pill-dot" />
                  </div>
                </div>

                <div className="ds-mini-navbar is-carbon">
                  <MiniStatusBar dark />
                  <div className="ds-mini-navbar__body">
                    <SanbsBrand light />
                    <span className="ds-mono-chip">OPS DISPATCH</span>
                  </div>
                </div>

                <div className="ds-mini-navbar">
                  <MiniStatusBar />
                  <div className="ds-mini-navbar__body">
                    <div>
                      <span className="eyebrow">ACTIVE PICKUP</span>
                      <strong style={{ display: 'block', fontSize: 14 }}>Sandton Centre</strong>
                    </div>
                    <StatusChip status="driver_on_the_way" compact />
                  </div>
                </div>
              </div>
            </div>

            {/* TAB BAR (CIRCULAR DOCK STATES) */}
            <div className="ds-kit-block">
              <div className="ds-kit-block__title">
                <h2>Tab bar</h2>
                <span className="ds-mono-note">Interactive 52px Circular Dock</span>
              </div>

              <div className="ds-tabbar-matrix">
                <div>
                  <span className="ds-group-label">Inactive / Idle Row</span>
                  <div className="ds-dock-bar-specimen">
                    {DOCK_DEMO_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="ds-dock-specimen-item">
                          <span className="dock-circle-btn">
                            <Icon size={17} />
                          </span>
                          <small>{item.label}</small>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="ds-group-label">Active Tab (Click any circle to switch active crimson state)</span>
                  <div className="ds-dock-bar-specimen is-interactive">
                    {DOCK_DEMO_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active = dockTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="ds-dock-specimen-item is-btn"
                          onClick={() => setDockTab(item.id)}
                        >
                          <span className={`dock-circle-btn ${active ? 'active' : ''}`}>
                            <Icon size={17} />
                          </span>
                          <small className={active ? 'is-active' : ''}>{item.label}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* BUTTONS: ACTIVE vs INACTIVE */}
            <div className="ds-kit-block">
              <div className="ds-kit-block__title">
                <h2>Buttons</h2>
              </div>

              <div className="ds-buttons-2col">
                <div className="ds-btn-col">
                  <span className="ds-group-label">Active</span>
                  <Button variant="primary" size="sm" onClick={() => onNotify?.('Book a free ride')}>
                    Book a ride <ArrowRight size={14} />
                  </Button>
                  <Button variant="carbon" size="sm">Assign driver</Button>
                  <Button variant="secondary" size="sm">Quick demo</Button>
                  <SplitCtaBanner
                    title="Book a ride"
                    kicker="SANBS Sandton · Free"
                    compact
                    onClick={() => setModalOpen(true)}
                  />
                </div>

                <div className="ds-btn-col">
                  <span className="ds-group-label">Inactive &amp; Compact Pills</span>
                  <Button variant="primary" size="sm" disabled>
                    Awaiting driver
                  </Button>
                  <Button variant="quiet" size="sm" disabled>
                    Return locked
                  </Button>
                  <div className="ds-mini-circle-actions">
                    <span className="ds-circle-chip is-carbon"><Plus size={15} /></span>
                    <span className="ds-circle-chip is-crimson"><ArrowRight size={15} /></span>
                    <span className="ds-circle-chip is-light"><Bell size={15} /></span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODALS (4-CARD MINI MATRIX MATCHING REFERENCE 1) */}
            <div className="ds-kit-block">
              <div className="ds-kit-block__title">
                <h2>Modals &amp; Feedback</h2>
                <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
                  Open live modal
                </Button>
              </div>

              <div className="ds-modals-2x2">
                <div className="ds-mini-modal is-light">
                  <span className="ds-modal-badge is-crimson"><X size={13} /></span>
                  <strong>Select pickup point</strong>
                  <small>Verify street address before dispatching driver.</small>
                </div>

                <div className="ds-mini-modal is-carbon">
                  <span className="ds-modal-badge is-green"><Check size={13} /></span>
                  <strong>Ride confirmed · SR-008</strong>
                  <small>Sipho Ndlovu is 4 min from Rosebank.</small>
                </div>

                <div className="ds-mini-modal is-light">
                  <span className="ds-modal-badge is-warn"><AlertTriangle size={13} /></span>
                  <strong>Awaiting authorisation</strong>
                  <small>SANBS staff will confirm return readiness.</small>
                  <span className="ds-mini-modal-action">Understood</span>
                </div>

                <div className="ds-mini-modal is-light">
                  <span className="ds-modal-badge is-crimson"><AlertTriangle size={13} /></span>
                  <strong>Cancel donor ride?</strong>
                  <small>Driver will be released back to the fleet.</small>
                  <div className="ds-mini-modal-split">
                    <span>Keep</span>
                    <span className="is-danger">Cancel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          BOARD 02 — SPLIT TABLET & FANNED MOBILE SHOWCASE (REFERENCE 2 LAYOUT)
         ==================================================================== */}
      <section id="ds-sec-devices" className="ds-editorial-devices">
        {/* SUB-BOARD A: SPLIT CARBON & CONCRETE TABLET / CONSOLE VERSION */}
        <div className="ds-tablet-stage">
          <div className="ds-split-backdrop" aria-hidden="true">
            <div className="ds-split-backdrop__dark" />
            <div className="ds-split-backdrop__light" />
          </div>

          <div className="ds-stage-inner">
            <header className="ds-stage-topbar">
              <span className="ds-stage-index">01</span>
              <span className="ds-stage-title">Tablet &amp; Staff Console Version</span>
              <span className="ds-stage-dims">768 × 1024</span>
            </header>

            <div className="ds-tablet-composition">
              {/* Main Tablet Hardware Frame */}
              <div className="ds-tablet-bezel">
                <div className="ds-tablet-screen">
                  <div className="ds-tablet-hero">
                    <div className="ds-tablet-nav">
                      <span>SANBS RIDE</span>
                      <span>Arrivals · Fleet · Dispatch</span>
                    </div>
                    <div className="ds-tablet-headline">
                      <small>Staff &amp; Operations</small>
                      <h3>
                        Coordinated donor mobility —
                        <br />
                        engineered in <em>carbon &amp; crimson</em>
                        <br />
                        across Gauteng.
                      </h3>
                    </div>
                    <div className="ds-tablet-stamp-pos">
                      <CircularSealStamp tone="crimson" size={56} />
                    </div>
                  </div>

                  <div className="ds-tablet-body">
                    <div>
                      <span className="ds-tb-kicker">01</span>
                      <p>Arrival Board</p>
                      <small>Live readiness</small>
                    </div>
                    <div>
                      <span className="ds-tb-kicker">Centres</span>
                      <p>Sandton Hub</p>
                      <p>Rosebank</p>
                      <p>Hatfield</p>
                      <p>Alberton</p>
                    </div>
                    <div>
                      <span className="ds-tb-kicker">Guardrail</span>
                      <p>
                        Strict operational transport data only—pickup coordinates, driver ETA, and return sign-off
                        with zero clinical fields.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Dark Telemetry Sheet */}
              <div className="ds-floating-sheet is-carbon">
                <div className="ds-sheet-head">
                  <span>03 · Fleet Telemetry</span>
                  <p>Coordinated live pickups, active return legs, and 28 fixed donor centres.</p>
                </div>
                <div className="ds-sheet-list">
                  <div><span>Active donor rides</span><strong>18+</strong></div>
                  <div><span>Gauteng SANBS centres</span><strong>28</strong></div>
                  <div><span>Target driver radius</span><strong>5 min</strong></div>
                  <div><span>WCAG AA+ contrast</span><strong>15/15</strong></div>
                </div>
                <div className="ds-sheet-corner-stamp">
                  <CircularSealStamp tone="crimson" size={58} />
                </div>
              </div>

              {/* Floating Crimson Action Poster Card */}
              <div className="ds-floating-sheet is-crimson">
                <div className="ds-sunburst-bg" aria-hidden="true" />
                <div className="ds-crimson-card-top">
                  <span>04 · Start Ride</span>
                </div>
                <div className="ds-crimson-card-mid">
                  <h3>It&apos;s time to donate safely</h3>
                </div>
                <div className="ds-crimson-card-stamp">
                  <CircularSealStamp tone="carbon" text="FREE DONOR RIDE · SANBS ·" size={76} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUB-BOARD B: FANNED 3-SCREEN MOBILE HANDHELD VERSION */}
        <div className="ds-mobile-stage">
          <div className="ds-stage-inner">
            <header className="ds-stage-topbar is-light">
              <span className="ds-stage-index">02</span>
              <span className="ds-stage-title">Mobile Handheld Version</span>
              <span className="ds-stage-dims">
                <strong>390 × 844</strong>
                <small>320px floor</small>
              </span>
            </header>

            <div className="ds-mobile-switcher-row">
              <div className="ds-pill-segment" role="tablist" aria-label="Center phone interactive preview">
                {[
                  { id: 'home', label: 'Donor Home' },
                  { id: 'ride', label: 'Active Ride' },
                  { id: 'centre', label: 'Sanctuary' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={phoneScreen === tab.id}
                    className={phoneScreen === tab.id ? 'is-active' : ''}
                    onClick={() => setPhoneScreen(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ds-fanned-trio">
              {/* Left Tilted Dark Screen */}
              <article className="ds-fanned-phone is-left-carbon">
                <div className="ds-fanned-head">
                  <span>03</span>
                  <span>Live Telemetry</span>
                </div>
                <div className="ds-fanned-metrics">
                  <div><span>ETA to pickup</span><strong style={{ color: COLORS.accentBright }}>4 min</strong></div>
                  <div><span>Route distance</span><strong>6.2 km</strong></div>
                  <div><span>Return readiness</span><strong>Included</strong></div>
                  <div><span>Service fee</span><strong>R 0.00</strong></div>
                </div>
                <div className="ds-fanned-ecg">
                  <EcgPulseLine stroke={COLORS.accentBright} width={160} height={24} animate={!reduceMotionDemo} />
                </div>
                <div className="ds-fanned-left-stamp">
                  <CircularSealStamp tone="crimson" size={56} />
                </div>
              </article>

              {/* Center Straight Interactive iPhone Hardware Bezel */}
              <article className="ds-center-iphone">
                <div className="ds-iphone-notch" aria-hidden="true" />
                <div className="ds-iphone-screen">
                  <MiniStatusBar />
                  {phoneScreen === 'home' && (
                    <div className="ds-phone-body">
                      <div className="ds-phone-header">
                        <div>
                          <span className="eyebrow">NEXT APPOINTMENT</span>
                          <h4>Hi Thabo</h4>
                        </div>
                        <span className="ds-phone-avatar">TM</span>
                      </div>

                      <div className="ds-phone-mini-map">
                        <RouteMap
                          from="Rosebank"
                          to="SANBS Sandton"
                          progress={0.48}
                          dark
                          hideChrome
                          compact
                        />
                      </div>

                      <SplitCtaBanner
                        title="Book a ride"
                        kicker="Sandton · 09:30 · Free return"
                        compact
                        onClick={() => setPhoneScreen('ride')}
                      />

                      <div className="ds-phone-bento-pair">
                        <div className="ds-phone-stat is-light">
                          <span>TRIPS</span>
                          <strong>12</strong>
                        </div>
                        <div className="ds-phone-stat is-dark">
                          <span>ETA</span>
                          <strong style={{ color: COLORS.accentBright }}>6 min</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {phoneScreen === 'ride' && (
                    <div className="ds-phone-body">
                      <div className="ds-phone-header">
                        <div>
                          <span className="eyebrow">SR-261127-008</span>
                          <h4>Driver en route</h4>
                        </div>
                        <StatusChip status="driver_on_the_way" compact />
                      </div>
                      <TelemetryStrip
                        progress={0.68}
                        items={[
                          { label: 'ETA', value: '4 min', accent: true },
                          { label: 'Dist', value: '2.1 km' },
                          { label: 'Leg', value: 'Pickup' },
                        ]}
                      />
                      <RouteStopStack
                        originTitle="14 Cradock Ave"
                        destTitle="SANBS Sandton"
                        destMeta="Sipho Ndlovu · GP 482 SAN"
                      />
                    </div>
                  )}

                  {phoneScreen === 'centre' && (
                    <div className="ds-phone-body">
                      <div className="ds-phone-sanctuary-card">
                        <img src={STUDIO_MEDIA.donorSanctuary} alt="SANBS Sanctuary Lounge" />
                        <span className="status-chip tone-green status-chip-compact">Checked in</span>
                      </div>
                      <div className="ds-phone-header" style={{ marginTop: 4 }}>
                        <div>
                          <span className="eyebrow">AT SANCTUARY</span>
                          <h4>SANBS Sandton</h4>
                        </div>
                        <Heart size={17} color={COLORS.accent} />
                      </div>
                      <p className="ds-phone-copy">
                        Staff authorise your free return driver right after refreshment rest.
                      </p>
                      <Button variant="primary" wide size="sm" onClick={() => setPhoneScreen('home')}>
                        Request return ride <ArrowRight size={14} />
                      </Button>
                    </div>
                  )}

                  <nav className="mobile-bottom-nav donor-circular-dock ds-phone-dock" aria-label="Phone dock">
                    {DOCK_DEMO_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active = dockTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`dock-circle-btn ${active ? 'active' : ''}`}
                          onClick={() => setDockTab(item.id)}
                          aria-label={item.label}
                        >
                          <Icon size={17} />
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </article>

              {/* Right Tilted Crimson Screen */}
              <article className="ds-fanned-phone is-right-crimson">
                <div className="ds-sunburst-bg" aria-hidden="true" />
                <div className="ds-fanned-head">
                  <span>04</span>
                  <span>Donor Impact</span>
                </div>
                <div className="ds-fanned-crimson-mid">
                  <h3>Do something life-saving</h3>
                  <div className="ds-fanned-crimson-stamp">
                    <CircularSealStamp tone="carbon" text="BOOK FREE RIDE · SANBS ·" size={74} />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          BOARD 03 — ILLUSTRATIONS, PHOTOGRAPHY & STEALTH MAPS
         ==================================================================== */}
      <section id="ds-sec-imagery" className="ds-poster-sheet">
        <div className="ds-kit-block">
          <div className="ds-kit-block__title">
            <h2>Illustrations &amp; Visual Stories</h2>
            <span className="ds-mono-note">Editorial Photography + Flat Journey Spot Art</span>
          </div>

          {/* 3 Clean Spot Illustrations Strip (Reference 1 Bottom Strip) */}
          <div className="ds-illustrations-strip">
            {[
              { src: STUDIO_MEDIA.illustBookRide, step: '01 · Request', title: 'Book free donor ride', alt: 'Minimalist line illustration of a donor booking a ride on a smartphone' },
              { src: STUDIO_MEDIA.illustDriverPickup, step: '02 · Pickup', title: 'Driver arrives at beacon', alt: 'Minimalist line illustration of a driver waving beside a white hatchback at a pickup beacon' },
              { src: STUDIO_MEDIA.illustSafeReturn, step: '03 · Return', title: 'Rest & safe trip home', alt: 'Minimalist line illustration of a relaxed donor enjoying refreshments after donating' },
            ].map((item) => (
              <figure key={item.step} className="ds-spot-figure">
                <div className="ds-spot-figure__img">
                  <img src={item.src} alt={item.alt} loading="lazy" />
                </div>
                <figcaption>
                  <span>{item.step}</span>
                  <strong>{item.title}</strong>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* 3 Bespoke Architectural Visual Cards */}
          <div className="ds-photo-triptych">
            <figure className="ds-photo-card">
              <img src={STUDIO_MEDIA.heroMobility} alt="Johannesburg twilight EV beside dark carbon pavilion with crimson accent line" loading="lazy" />
              <figcaption>
                <span className="ds-mono-note">FLEET PHOTOGRAPHY</span>
                <strong>Twilight Carbon &amp; White Mobility</strong>
              </figcaption>
            </figure>

            <figure className="ds-photo-card">
              <img src={STUDIO_MEDIA.donorSanctuary} alt="Sunlit minimalist white SANBS donor sanctuary interior" loading="lazy" />
              <figcaption>
                <span className="ds-mono-note">SANCTUARY ARCHITECTURE</span>
                <strong>Daylight Calm &amp; Pure Paper Surfaces</strong>
              </figcaption>
            </figure>

            <figure className="ds-photo-card is-dark">
              <img src={STUDIO_MEDIA.stealthGrid} alt="Isometric dark stealth city map with white origin beacon and crimson route" loading="lazy" />
              <figcaption>
                <span className="ds-mono-note">STEALTH CARTOGRAPHY</span>
                <strong>Obsidian Terrain &amp; #FF3B42 Routes</strong>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Interactive Brand Mark + Drop Fill + Stealth RouteMap Playground */}
        <div className="ds-kit-block" style={{ marginTop: 32 }}>
          <div className="ds-kit-block__title">
            <h2>Stealth RouteMaps &amp; Brand Telemetry</h2>
          </div>

          <div className="ds-map-brand-2col">
            <div className="ds-map-playground">
              <div className="ds-map-controls-bar">
                <div className="ds-filter-tabs">
                  <button type="button" className={`ds-filter-tab ${mapTheme === 'stealth' ? 'is-active' : ''}`} onClick={() => setMapTheme('stealth')}>
                    Stealth Dark
                  </button>
                  <button type="button" className={`ds-filter-tab ${mapTheme === 'light' ? 'is-active' : ''}`} onClick={() => setMapTheme('light')}>
                    Light Paper
                  </button>
                </div>
                <div className="ds-filter-tabs">
                  <button type="button" className={`ds-filter-tab ${mapLeg === 'outbound' ? 'is-active' : ''}`} onClick={() => setMapLeg('outbound')}>
                    Outbound
                  </button>
                  <button type="button" className={`ds-filter-tab ${mapLeg === 'return' ? 'is-active' : ''}`} onClick={() => setMapLeg('return')}>
                    Return
                  </button>
                </div>
              </div>

              <div className="ds-slider-row">
                <label htmlFor="ds-map-range">Vehicle position: <strong>{Math.round(mapProgress * 100)}%</strong></label>
                <input id="ds-map-range" type="range" min={0} max={100} value={Math.round(mapProgress * 100)} onChange={(e) => setMapProgress(Number(e.target.value) / 100)} />
              </div>

              <div className="ds-map-frame">
                <RouteMap from="14 Cradock Ave, Rosebank" to="SANBS Sandton Donor Centre" progress={mapProgress} reverse={mapLeg === 'return'} dark={mapTheme === 'stealth'} />
              </div>
            </div>

            <div className="ds-brand-drop-column">
              <div className="ds-dark-telemetry-panel" key={splashKey}>
                <div className="ds-dark-panel-head">
                  <div className="ds-ecg-disc"><BrandMark size={24} tone="white" /></div>
                  <EcgPulseLine stroke={COLORS.accentBright} width={160} height={26} animate={!reduceMotionDemo} />
                  <button type="button" className="ds-mini-replay" onClick={() => setSplashKey((k) => k + 1)} aria-label="Replay heartbeat">
                    <RotateCcw size={14} />
                  </button>
                </div>

                <div className="ds-drop-scrubber">
                  <SanbsDropPin fillPercent={dropFill} size={46} />
                  <div className="ds-drop-scrubber__controls">
                    <div className="ds-drop-scrubber__meta">
                      <span>Liquid Drop Fill</span>
                      <strong>{dropFill}%</strong>
                    </div>
                    <input type="range" min={0} max={100} value={dropFill} onChange={(e) => setDropFill(Number(e.target.value))} aria-label="Drop fill percentage" />
                  </div>
                </div>

                <div className="ds-sparkline-card">
                  <div className="ds-sparkline-head">
                    <span>Weekly Donor Trips</span>
                    <strong style={{ color: MAP_PALETTE.chart.darkLine }}>42 rides</strong>
                  </div>
                  <svg viewBox="0 0 280 78" className="ds-sparkline-svg" aria-label="Weekly donor trips chart">
                    <line x1="0" y1="20" x2="280" y2="20" stroke={MAP_PALETTE.chart.darkGrid} />
                    <line x1="0" y1="52" x2="280" y2="52" stroke={MAP_PALETTE.chart.darkGrid} />
                    <polyline
                      fill="none"
                      stroke={MAP_PALETTE.chart.darkLine}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="10,60 56,48 102,54 148,30 194,36 240,14 270,18"
                    />
                    {[[10, 60], [56, 48], [102, 54], [148, 30], [194, 36], [240, 14], [270, 18]].map(([cx, cy], idx) => (
                      <circle key={idx} cx={cx} cy={cy} r="4" fill={MAP_PALETTE.chart.darkPointFill} stroke={MAP_PALETTE.chart.darkPointStroke} strokeWidth="2" />
                    ))}
                  </svg>
                </div>

                <div className="ds-brand-files-row">
                  {BRAND_ARTWORK.files.slice(0, 4).map((f) => (
                    <span key={f} className="ds-mono-chip">{f.replace('/brand/', '')}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          BOARD 04 — ICONOGRAPHY STUDIO
         ==================================================================== */}
      <section id="ds-sec-icons" className="ds-poster-sheet" style={{ marginTop: 36 }}>
        <div className="ds-kit-block">
          <div className="ds-kit-block__title">
            <h2>Iconography ({filteredIcons.length} Verified Glyphs)</h2>
            <div className="ds-icon-controls">
              <div className="ds-filter-tabs" role="tablist" aria-label="Filter icon category">
                {['All', 'Mobility', 'Donor Care', 'Telemetry', 'Alerts'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={iconCategory === cat}
                    className={`ds-filter-tab ${iconCategory === cat ? 'is-active' : ''}`}
                    onClick={() => setIconCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="ds-control-group">
                <span>Stroke</span>
                {[1.5, 2, 2.5].map((sw) => (
                  <button key={sw} type="button" className={`ds-mini-opt ${iconStroke === sw ? 'is-active' : ''}`} onClick={() => setIconStroke(sw)}>
                    {sw}
                  </button>
                ))}
              </div>

              <div className="ds-control-group">
                <span>Surface</span>
                {[
                  { id: 'carbon', label: 'Carbon' },
                  { id: 'crimson', label: 'Crimson' },
                  { id: 'paper', label: 'Paper' },
                  { id: 'raw', label: 'Glyph' },
                ].map((st) => (
                  <button key={st.id} type="button" className={`ds-mini-opt ${iconBadgeStyle === st.id ? 'is-active' : ''}`} onClick={() => setIconBadgeStyle(st.id)}>
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ds-icon-grid">
            {filteredIcons.map((item) => {
              const Glyph = item.Icon;
              const snippet = `<${item.name} size={20} strokeWidth={${iconStroke}} />`;
              const isCopied = copiedId === `icon-${item.name}`;
              return (
                <button
                  key={item.name}
                  type="button"
                  className={`ds-icon-tile ${isCopied ? 'is-copied' : ''}`}
                  onClick={() => copyToken(snippet, `icon-${item.name}`)}
                  title={`Copy ${snippet}`}
                >
                  <span className={`ds-icon-well is-${iconBadgeStyle}`}>
                    <Glyph size={20} strokeWidth={iconStroke} aria-hidden="true" />
                  </span>
                  <strong>{item.name}</strong>
                  <small>{isCopied ? 'Copied JSX!' : item.usage}</small>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          BOARD 05 — 14-STATE JOURNEY LIFECYCLE, SPACING & ACCESSIBILITY RULES
         ==================================================================== */}
      <section id="ds-sec-states" className="ds-poster-sheet" style={{ marginTop: 36 }}>
        <div className="ds-kit-block">
          <div className="ds-kit-block__title">
            <h2>14-State Journey Lifecycle &amp; Fleet</h2>
            <div className="ds-filter-tabs" role="tablist" aria-label="Filter journey states by leg">
              {['All', 'Outbound', 'Centre', 'Return', 'Final'].map((leg) => (
                <button
                  key={leg}
                  type="button"
                  role="tab"
                  aria-selected={legFilter === leg}
                  className={`ds-filter-tab ${legFilter === leg ? 'is-active' : ''}`}
                  onClick={() => setLegFilter(leg)}
                >
                  {leg}
                </button>
              ))}
            </div>
          </div>

          <div className="ds-status-chips">
            {filteredStatuses.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`ds-status-pick ${selectedStatus === item.key ? 'is-selected' : ''}`}
                onClick={() => setSelectedStatus(item.key)}
              >
                <StatusChip status={item.key} />
                <small>{item.leg}</small>
              </button>
            ))}
          </div>

          <div className="ds-lifecycle-preview">
            <div className="ds-lifecycle-preview__left">
              <TelemetryStrip
                progress={selectedStatus === 'completed' ? 1 : selectedStatus.startsWith('return') ? 0.85 : 0.48}
                items={[
                  { label: 'Phase', value: activeStatusMeta.label.split(' ')[0], accent: true },
                  { label: 'Booking', value: 'SR-008' },
                  { label: 'Owner', value: selectedStatus.includes('authoris') ? 'SANBS Staff' : 'Driver / Ops' },
                ]}
              />
              <RouteStopStack
                originTitle="14 Cradock Ave, Rosebank"
                originMeta="Verified street pickup · 08:45"
                destTitle="SANBS Sandton Donor Centre"
                destMeta="Round-trip return readiness included"
              />
              <div className="ds-fleet-row">
                <OriginTag origin="donor" />
                <OriginTag origin="staff" />
                {AVATAR_TONES.map((tone, i) => (
                  <DriverAvatar key={tone.id} driver={{ initials: ['SN', 'LM', 'TM', 'PK'][i], color: tone.id }} size="small" />
                ))}
              </div>
            </div>
            <div className="ds-lifecycle-preview__right">
              <Kicker>Synchronized JourneyTimeline ({isReturnLeg ? 'Return leg' : 'Outbound leg'})</Kicker>
              <JourneyTimeline booking={previewBooking} leg={isReturnLeg ? 'return' : 'outbound'} />
            </div>
          </div>
        </div>

        {/* Bottom Guardrails & Tokens Summary */}
        <div className="ds-kit-block" style={{ marginTop: 32 }}>
          <div className="ds-kit-block__title">
            <h2>Spacing, Radii &amp; WCAG 2.2 AA Guardrails</h2>
            <span className="ds-mono-note">4px grid · 999px pills · 44px touch targets</span>
          </div>

          <div className="ds-tokens-2col">
            <div className="ds-spacing-compact">
              {SPACING.slice(0, 8).map((s) => (
                <div key={s.token} className="ds-spacing-row">
                  <code>{s.token}</code>
                  <span>{s.px}px</span>
                  <div className="ds-spacing-bar-wrap"><span className="ds-spacing-bar" style={{ width: `${Math.min(100, s.px * 2.5)}%` }} /></div>
                  <small>{s.usage}</small>
                </div>
              ))}
              <div className="ds-radii-strip">
                {RADII.slice(0, 6).map((r) => (
                  <span key={r.token} className="ds-radius-pill" style={{ borderRadius: r.value === '999px' ? '999px' : r.value }}>
                    {r.token.replace('--r-', '')} · {r.value}
                  </span>
                ))}
              </div>
            </div>

            <div className="ds-a11y-compact-grid">
              {ACCESSIBILITY_RULES.map((rule) => (
                <div key={rule.id} className="ds-a11y-item">
                  <div className="ds-a11y-item__top">
                    <CheckCircle2 size={15} color={COLORS.ok} aria-hidden="true" />
                    <strong>{rule.title}</strong>
                    <span className="status-chip tone-green status-chip-compact">{rule.metric}</span>
                  </div>
                  <small>{rule.detail}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {modalOpen && (
        <ModalFrame
          onClose={() => setModalOpen(false)}
          title="Book Assisted Donor Ride"
          subtitle="Example ModalFrame adhering to --r-2xl (34px) geometry, Escape dismissal, and accessible focus return."
          footer={
            <div className="ds-modal-footer">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => { setModalOpen(false); onNotify?.('Confirmed preview modal'); }}>
                Confirm preview
              </Button>
            </div>
          }
        >
          <div className="ds-modal-demo-body">
            <div className="ds-alert-note">
              <AlertTriangle size={16} aria-hidden="true" />
              <span>POPIA Notice: Collect pickup location, contact number, and return preference only.</span>
            </div>
            <RouteStopStack
              originTitle="14 Cradock Ave, Rosebank"
              destTitle="SANBS Sandton Donor Centre"
              destMeta="6.2 km · Free round-trip"
            />
          </div>
        </ModalFrame>
      )}
    </div>
  );
}
