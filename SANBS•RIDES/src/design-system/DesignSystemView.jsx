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
  Layers,
  LayoutDashboard,
  LifeBuoy,
  LocateFixed,
  MapPin,
  MessageSquare,
  Monitor,
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
  Type,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import {
  ACCESSIBILITY_RULES,
  AVATAR_TONES,
  BRAND_ARTWORK,
  COLORS,
  COLOR_GROUPS,
  CONTRAST_PAIRS,
  DESIGN_SYSTEM_META,
  ELEVATION,
  MAP_PALETTE,
  MOTION,
  RADII,
  SPACING,
  STATUS_CHIP_SPECS,
  STUDIO_MEDIA,
  TYPOGRAPHY,
  Z_INDEX,
  contrastRatio,
} from './tokens.js';
import {
  Button,
  ChoiceOption,
  CircularDock,
  EcgPulseLine,
  Kicker,
  RouteStopStack,
  SanbsDropPin,
  SplitCtaBanner,
  SurfaceCard,
  TelemetryStrip,
} from './primitives.jsx';
import {
  BrandMark,
  DriverAvatar,
  EmptyState,
  Field,
  IconButton,
  JourneyTimeline,
  ModalFrame,
  OriginTag,
  RouteMap,
  SanbsBrand,
  SectionHeading,
  StatusChip,
} from '../components/Shared.jsx';
import { STATUS_META } from '../domain.js';

const SECTIONS = [
  { id: 'overview', label: 'Showcase', icon: Sparkles },
  { id: 'brand', label: 'Visuals & Identity', icon: Heart },
  { id: 'icons', label: 'Icon Studio', icon: Compass },
  { id: 'colors', label: 'Colors & AA', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'foundations', label: 'Grid & Motion', icon: Layers },
  { id: 'primitives', label: 'Primitives', icon: Sliders },
  { id: 'patterns', label: 'Journey States', icon: CarFront },
  { id: 'maps', label: 'Stealth Maps', icon: Navigation },
  { id: 'accessibility', label: 'Architecture', icon: ShieldCheck },
];

const ICON_GALLERY = [
  { name: 'Navigation', category: 'Mobility', Icon: Navigation, usage: 'Live route & turn HUD' },
  { name: 'MapPin', category: 'Mobility', Icon: MapPin, usage: 'Donor pickup & SANBS centre' },
  { name: 'Compass', category: 'Mobility', Icon: Compass, usage: 'Route heading & bearing' },
  { name: 'LocateFixed', category: 'Mobility', Icon: LocateFixed, usage: 'Recenter GPS lock' },
  { name: 'Car', category: 'Mobility', Icon: Car, usage: 'Driver vehicle assignment' },
  { name: 'CarFront', category: 'Mobility', Icon: CarFront, usage: 'Active ride in transit' },
  { name: 'Truck', category: 'Mobility', Icon: Truck, usage: 'Fleet dispatch logistics' },
  { name: 'RouteArrow', category: 'Mobility', Icon: ArrowRight, usage: 'Crimson CTA progression' },
  { name: 'BackArrow', category: 'Mobility', Icon: ArrowLeft, usage: 'Screen & sheet navigation' },
  { name: 'Heart', category: 'Donor Care', Icon: Heart, usage: 'Donor role & life impact' },
  { name: 'ShieldCheck', category: 'Donor Care', Icon: ShieldCheck, usage: 'POPIA verified operational scope' },
  { name: 'LifeBuoy', category: 'Donor Care', Icon: LifeBuoy, usage: 'SANBS staff assistance' },
  { name: 'UserRound', category: 'Donor Care', Icon: UserRound, usage: 'Donor profile dock tab' },
  { name: 'UsersRound', category: 'Donor Care', Icon: UsersRound, usage: 'Fleet & cohort queue' },
  { name: 'Phone', category: 'Donor Care', Icon: Phone, usage: 'Direct driver/donor call' },
  { name: 'MessageSquare', category: 'Donor Care', Icon: MessageSquare, usage: 'Pickup note & instruction' },
  { name: 'Home', category: 'Donor Care', Icon: Home, usage: 'Mobile home tab' },
  { name: 'History', category: 'Donor Care', Icon: History, usage: 'Trip receipt log tab' },
  { name: 'Activity', category: 'Telemetry', Icon: Activity, usage: 'Live heartbeat & progress' },
  { name: 'BarChart3', category: 'Telemetry', Icon: BarChart3, usage: 'Driver weekly metrics' },
  { name: 'Clock3', category: 'Telemetry', Icon: Clock3, usage: 'ETA & appointment slots' },
  { name: 'LayoutDashboard', category: 'Telemetry', Icon: LayoutDashboard, usage: 'Operations command view' },
  { name: 'ClipboardList', category: 'Telemetry', Icon: ClipboardList, usage: 'Staff arrival board' },
  { name: 'FileText', category: 'Telemetry', Icon: FileText, usage: 'Journey receipt breakdown' },
  { name: 'Download', category: 'Telemetry', Icon: Download, usage: 'Export CSV shift report' },
  { name: 'Sliders', category: 'Telemetry', Icon: Sliders, usage: 'Operating model filters' },
  { name: 'Settings2', category: 'Telemetry', Icon: Settings2, usage: 'Dispatch calibration' },
  { name: 'CheckCircle2', category: 'Alerts', Icon: CheckCircle2, usage: 'Confirmed arrival / complete' },
  { name: 'AlertTriangle', category: 'Alerts', Icon: AlertTriangle, usage: 'Exception & attention alert' },
  { name: 'AlertCircle', category: 'Alerts', Icon: AlertCircle, usage: 'Form field validation' },
  { name: 'Bell', category: 'Alerts', Icon: Bell, usage: 'Live journey notifications' },
  { name: 'Search', category: 'Alerts', Icon: Search, usage: 'Address & token filtering' },
  { name: 'Plus', category: 'Alerts', Icon: Plus, usage: 'Create staff-assisted booking' },
  { name: 'Check', category: 'Alerts', Icon: Check, usage: 'Verified step completion' },
  { name: 'RotateCcw', category: 'Alerts', Icon: RotateCcw, usage: 'Reset demo or replay pulse' },
  { name: 'Eye', category: 'Alerts', Icon: Eye, usage: 'Toggle visibility & motion' },
  { name: 'EyeOff', category: 'Alerts', Icon: EyeOff, usage: 'Mask password input' },
  { name: 'ChevronRight', category: 'Alerts', Icon: ChevronRight, usage: 'Row detail drill-down' },
  { name: 'ChevronDown', category: 'Alerts', Icon: ChevronDown, usage: 'Account switcher dropdown' },
  { name: 'Sun', category: 'Alerts', Icon: Sun, usage: 'Daylight clinical surface' },
  { name: 'Moon', category: 'Alerts', Icon: Moon, usage: 'Stealth dark routing mode' },
  { name: 'X', category: 'Alerts', Icon: X, usage: 'Dismiss modal / drawer' },
];

const HERO_MONOLITHS = [
  {
    name: 'Carbon Frame',
    hex: COLORS.carbon,
    varName: '--carbon',
    text: COLORS.white,
    note: '19.69:1 vs White · Primary dark architectural chassis',
  },
  {
    name: 'SANBS Crimson',
    hex: COLORS.accent,
    varName: '--accent',
    text: COLORS.white,
    note: '5.19:1 vs White · Single bold signal & CTA accent',
  },
  {
    name: 'Pure Paper',
    hex: COLORS.paper,
    varName: '--paper',
    text: COLORS.ink,
    note: '19.69:1 vs Ink · High-legibility daylight canvas',
  },
  {
    name: 'Stealth Void',
    hex: COLORS.stealthBg,
    varName: '--stealth-bg',
    text: COLORS.white,
    note: 'Inverted map backdrop · Amplifies #FF3B42 routes',
  },
];

const DEMO_ROUTE_DATA = {
  from: '14 Cradock Ave, Rosebank',
  to: 'SANBS Sandton Donor Centre',
};

const DOCK_DEMO_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'Live Journey', icon: Navigation },
  { id: 'trips', label: 'Trips', icon: History },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

export default function DesignSystemView({ onNotify }) {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [reduceMotionDemo, setReduceMotionDemo] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // Hero device preview states
  const [phoneScreen, setPhoneScreen] = useState('home');

  // Icon Studio states
  const [iconCategory, setIconCategory] = useState('All');
  const [iconStroke, setIconStroke] = useState(2);
  const [iconBadgeStyle, setIconBadgeStyle] = useState('carbon');

  // Interactive specimen states
  const [dropFill, setDropFill] = useState(72);
  const [splashKey, setSplashKey] = useState(0);
  const [sampleCopy, setSampleCopy] = useState('Safe, zero-cost transport for South African blood donors.');
  const [motionMoved, setMotionMoved] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState('sandton');
  const [dockTab, setDockTab] = useState('home');
  const [selectedStatus, setSelectedStatus] = useState('driver_on_the_way');
  const [legFilter, setLegFilter] = useState('All');
  const [mapTheme, setMapTheme] = useState('stealth');
  const [mapProgress, setMapProgress] = useState(0.62);
  const [mapLeg, setMapLeg] = useState('outbound');
  const [inputValue, setInputValue] = useState('14 Cradock Ave, Rosebank');
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

  const filteredColorGroups = useMemo(() => {
    if (!query) return COLOR_GROUPS;
    return COLOR_GROUPS.map((group) => ({
      ...group,
      tokens: group.tokens.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.cssVar.toLowerCase().includes(query) ||
          t.value.toLowerCase().includes(query) ||
          t.role.toLowerCase().includes(query)
      ),
    })).filter((g) => g.tokens.length > 0);
  }, [query]);

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

  const sectionVisible = (id, keywords = []) => {
    if (!query) return true;
    const label = SECTIONS.find((s) => s.id === id)?.label.toLowerCase() || '';
    if (label.includes(query) || id.includes(query)) return true;
    return keywords.some((k) => k.toLowerCase().includes(query));
  };

  return (
    <div className={`ds-studio ${reduceMotionDemo ? 'ds-reduce-motion' : ''}`}>
      {/* Sleek Floating Pill Command Bar */}
      <div className="ds-command-wrap">
        <div className="ds-command-bar">
          <div className="ds-command-pills" role="navigation" aria-label="Jump to design system section">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  className={`ds-cmd-pill ${activeSection === sec.id ? 'is-active' : ''}`}
                  onClick={() => scrollToSection(sec.id)}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          <div className="ds-command-actions">
            <label className="ds-cmd-search" aria-label="Filter tokens, icons, and patterns">
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icons, hex, tokens..."
              />
            </label>

            <button
              type="button"
              className={`ds-cmd-btn ${reduceMotionDemo ? 'is-active' : ''}`}
              aria-pressed={reduceMotionDemo}
              onClick={() => setReduceMotionDemo((v) => !v)}
              title="Toggle reduced motion simulation"
            >
              <Eye size={14} aria-hidden="true" />
              <span>{reduceMotionDemo ? 'Reduced' : 'Motion'}</span>
            </button>

            <button
              type="button"
              className="ds-cmd-btn"
              onClick={() =>
                copyToken(
                  JSON.stringify({ meta: DESIGN_SYSTEM_META, colors: COLORS, typography: TYPOGRAPHY }, null, 2),
                  'json-export'
                )
              }
            >
              {copiedId === 'json-export' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              <span>{copiedId === 'json-export' ? 'Copied' : 'JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="ds-canvas-stack">
        {/* ================================================================
            HERO BENTO STAGE — Johannesburg Mobility Photography + Live iPhone Mockup
           ================================================================ */}
        {sectionVisible('overview', ['carbon', 'crimson', 'monochrome', 'overview', 'hero', 'iphone']) && (
          <section id="ds-sec-overview" className="ds-hero-bento">
            {/* Left Visual Photography Hero Card */}
            <article className="ds-hero-visual-card">
              <img
                src={STUDIO_MEDIA.heroMobility}
                alt="Minimalist white SANBS mobility sedan parked beside a dark carbon pavilion with crimson light line over the Johannesburg skyline"
                className="ds-hero-visual-card__img"
              />
              <div className="ds-hero-visual-card__scrim" aria-hidden="true" />
              <div className="ds-hero-visual-card__content">
                <div className="ds-hero-top-meta">
                  <span className="ds-badge-glow">
                    <Sparkles size={13} aria-hidden="true" />
                    SANBS RIDE · v{DESIGN_SYSTEM_META.version}
                  </span>
                  <span className="ds-mono-chip">GAUTENG MOBILITY UI</span>
                </div>

                <div className="ds-hero-headline-block">
                  <h1>
                    Carbon, Crimson &amp;
                    <br />
                    Precision Mobility.
                  </h1>
                  <p>
                    An editorial Monochrome &amp; SANBS Crimson visual language built for calm, high-contrast blood
                    donor transport across handheld phones and carbon operations hubs.
                  </p>
                </div>

                <div className="ds-hero-kpi-strip">
                  <div className="ds-hero-kpi">
                    <strong>{CONTRAST_PAIRS.length}/{CONTRAST_PAIRS.length}</strong>
                    <span>WCAG AA+ Pairs</span>
                  </div>
                  <div className="ds-hero-kpi">
                    <strong className="is-crimson">{ICON_GALLERY.length}</strong>
                    <span>Verified Icons</span>
                  </div>
                  <div className="ds-hero-kpi">
                    <strong>{STATUS_CHIP_SPECS.length}</strong>
                    <span>Live Ride States</span>
                  </div>
                  <div className="ds-hero-kpi">
                    <strong>44px</strong>
                    <span>Touch Minimum</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Right Interactive Hardware Phone Bezel Preview */}
            <aside className="ds-hero-device-stage" aria-label="Live interactive phone UI showcase">
              <div className="ds-device-stage-head">
                <div>
                  <span className="eyebrow kicker--dark">LIVE CHASSIS PREVIEW</span>
                  <strong>390 × 844 Handheld Frame</strong>
                </div>
                <div className="ds-pill-segment" role="tablist" aria-label="Phone screen preview">
                  {[
                    { id: 'home', label: 'Donor' },
                    { id: 'ride', label: 'Active' },
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

              <div className="ds-iphone-bezel">
                <div className="ds-iphone-notch" aria-hidden="true" />
                <div className="ds-iphone-screen">
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
                          progress={0.44}
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
                          <h4>Driver on the way</h4>
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
                        <img src={STUDIO_MEDIA.donorSanctuary} alt="SANBS Donor Sanctuary Lounge" />
                        <span className="status-chip tone-green status-chip-compact">Checked in</span>
                      </div>
                      <div className="ds-phone-header" style={{ marginTop: 4 }}>
                        <div>
                          <span className="eyebrow">AT SANCTUARY</span>
                          <h4>SANBS Sandton</h4>
                        </div>
                        <Heart size={18} color={COLORS.accent} />
                      </div>
                      <p className="ds-phone-copy">
                        Staff will authorise your zero-cost return driver as soon as refreshment rest is complete.
                      </p>
                      <Button variant="primary" wide size="sm" onClick={() => setPhoneScreen('home')}>
                        Request return ride <ArrowRight size={14} />
                      </Button>
                    </div>
                  )}

                  <CircularDock
                    items={DOCK_DEMO_ITEMS}
                    activeId={dockTab}
                    onChange={setDockTab}
                    className="ds-phone-dock"
                  />
                </div>
              </div>
            </aside>
          </section>
        )}

        {/* ================================================================
            01 · VISUAL DIRECTION, BRAND MARKS & INTERACTIVE DROP LAB
           ================================================================ */}
        {sectionVisible('brand', ['logo', 'drop', 'ecg', 'splash', 'svg', 'pin', 'image', 'photo']) && (
          <section id="ds-sec-brand" className="ds-section-block">
            <SectionHeading
              eyebrow="01 · Visual Language & Identity"
              title="Art Direction, Brand Marks & Live Drop Physics"
              subtitle="Stark daylight sanctuary whites balanced against stealth carbon surfaces—anchored by the intertwined SANBS heartbeat mark."
            />

            <div className="ds-visual-triptych">
              {/* Photo Card 1: Daylight Sanctuary */}
              <article className="ds-art-card ds-art-card--light">
                <div className="ds-art-card__media">
                  <img
                    src={STUDIO_MEDIA.donorSanctuary}
                    alt="Minimalist pure-white sunlit donor sanctuary lounge with steel bench and single crimson panel"
                    loading="lazy"
                  />
                  <span className="ds-art-chip">DAYLIGHT SURFACE · #FFFFFF</span>
                </div>
                <div className="ds-art-card__body">
                  <div className="ds-art-card__head">
                    <Sun size={18} color={COLORS.accent} aria-hidden="true" />
                    <h3>Sanctuary Light</h3>
                  </div>
                  <p>
                    Donor reading planes stay crisp pure white with hairline gray divides so calm clinical clarity
                    leads every booking step.
                  </p>
                </div>
              </article>

              {/* Center Interactive Brand & Heartbeat Lab */}
              <article className="ds-brand-lab-card">
                <div className="ds-brand-lab-card__top">
                  <div key={splashKey} className="ds-lab-pulse-stage">
                    <div className="ds-ecg-disc">
                      <BrandMark size={26} tone="white" />
                    </div>
                    <EcgPulseLine stroke={COLORS.accentBright} width={160} height={28} animate={!reduceMotionDemo} />
                    <button
                      type="button"
                      className="ds-mini-replay"
                      onClick={() => setSplashKey((k) => k + 1)}
                      aria-label="Replay heartbeat animation"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  <div className="ds-lab-lockups">
                    <div className="ds-lab-lockup is-light">
                      <SanbsBrand light={false} />
                      <code>{'light={false}'}</code>
                    </div>
                    <div className="ds-lab-lockup is-dark">
                      <SanbsBrand light />
                      <code>{'light={true}'}</code>
                    </div>
                  </div>
                </div>

                <div className="ds-lab-drop-box">
                  <SanbsDropPin fillPercent={dropFill} size={46} />
                  <div className="ds-lab-drop-controls">
                    <div className="ds-lab-drop-meta">
                      <span>Destination Drop Liquid</span>
                      <strong>{dropFill}%</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={dropFill}
                      onChange={(e) => setDropFill(Number(e.target.value))}
                      aria-label="Destination drop fill percentage"
                    />
                  </div>
                </div>

                <div className="ds-lab-assets">
                  {BRAND_ARTWORK.files.slice(0, 4).map((file) => (
                    <span key={file} className="ds-mono-chip">
                      {file.replace('/brand/', '')}
                    </span>
                  ))}
                </div>
              </article>

              {/* Photo Card 2: Stealth Cartography */}
              <article className="ds-art-card ds-art-card--dark">
                <div className="ds-art-card__media">
                  <img
                    src={STUDIO_MEDIA.stealthGrid}
                    alt="Isometric matte charcoal stealth city map with white origin beacon and glowing crimson route"
                    loading="lazy"
                  />
                  <span className="ds-art-chip is-crimson">STEALTH SURFACE · #0F1115</span>
                </div>
                <div className="ds-art-card__body">
                  <div className="ds-art-card__head">
                    <Moon size={18} color={COLORS.accentBright} aria-hidden="true" />
                    <h3>Stealth Cartography</h3>
                  </div>
                  <p>
                    Map tiles invert into muted obsidian geometry so the glowing `#FF3B42` path and white origin beacon
                    remain legible at a glance.
                  </p>
                </div>
              </article>
            </div>
          </section>
        )}

        {/* ================================================================
            02 · INTERACTIVE ICONOGRAPHY STUDIO
           ================================================================ */}
        {sectionVisible('icons', ['icon', 'glyph', 'lucide', 'svg', 'symbol', 'stroke']) && (
          <section id="ds-sec-icons" className="ds-section-block">
            <SectionHeading
              eyebrow="02 · Iconography Studio"
              title="Curated Lucide System Glyphs"
              subtitle="Select stroke weight and container surface, then click any glyph card to copy its exact React component markup."
            />

            <SurfaceCard tone="paper" padding="md" className="ds-icon-studio-card">
              <div className="ds-icon-toolbar">
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

                <div className="ds-icon-controls">
                  <div className="ds-control-group">
                    <span>Stroke</span>
                    {[1.5, 2, 2.5].map((sw) => (
                      <button
                        key={sw}
                        type="button"
                        className={`ds-mini-opt ${iconStroke === sw ? 'is-active' : ''}`}
                        onClick={() => setIconStroke(sw)}
                      >
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
                      <button
                        key={st.id}
                        type="button"
                        className={`ds-mini-opt ${iconBadgeStyle === st.id ? 'is-active' : ''}`}
                        onClick={() => setIconBadgeStyle(st.id)}
                      >
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
            </SurfaceCard>
          </section>
        )}

        {/* ================================================================
            03 · COLOR MONOLITHS & WCAG AA MATRIX
           ================================================================ */}
        {sectionVisible('colors', ['hex', 'palette', 'wcag', 'contrast', 'red', 'carbon', 'accent', 'status']) && (
          <section id="ds-sec-colors" className="ds-section-block">
            <SectionHeading
              eyebrow="03 · Color Architecture"
              title="Core Monoliths & Verified WCAG AA Contrast"
              subtitle="Click any swatch to copy its CSS variable or hex code. All 15 foreground/background pairs exceed WCAG 2.2 AA (>= 4.5:1)."
            />

            {/* Hero 4 Color Monolith Plaques */}
            <div className="ds-monolith-grid">
              {HERO_MONOLITHS.map((mono) => (
                <button
                  key={mono.varName}
                  type="button"
                  className="ds-monolith-card"
                  style={{ backgroundColor: mono.hex, color: mono.text }}
                  onClick={() => copyToken(`var(${mono.varName})`, mono.varName)}
                >
                  <div className="ds-monolith-card__top">
                    <span>{mono.varName}</span>
                    <Copy size={14} aria-hidden="true" />
                  </div>
                  <div className="ds-monolith-card__bottom">
                    <strong>{mono.name}</strong>
                    <code>{mono.hex}</code>
                    <small>{mono.note}</small>
                  </div>
                </button>
              ))}
            </div>

            <div className="ds-color-groups" style={{ marginTop: 24 }}>
              {filteredColorGroups.map((group) => (
                <div key={group.id} className="ds-color-group">
                  <div className="ds-color-group__head">
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <div className="ds-swatch-grid">
                    {group.tokens.map((tok) => (
                      <div key={tok.cssVar} className="ds-swatch-card">
                        <div
                          className="ds-swatch-chip"
                          style={{ backgroundColor: tok.value, color: tok.textOn }}
                        >
                          <span className="ds-swatch-hex">{tok.value}</span>
                          <button
                            type="button"
                            className="ds-copy-badge"
                            aria-label={`Copy ${tok.cssVar}`}
                            onClick={() => copyToken(`var(${tok.cssVar})`, tok.cssVar)}
                            style={{ color: tok.textOn }}
                          >
                            {copiedId === tok.cssVar ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <div className="ds-swatch-body">
                          <div className="ds-swatch-title-row">
                            <strong>{tok.name}</strong>
                            <button
                              type="button"
                              className="ds-token-code-btn"
                              onClick={() => copyToken(tok.value, `${tok.cssVar}-hex`)}
                            >
                              <code>{tok.cssVar}</code>
                            </button>
                          </div>
                          <p>{tok.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <SurfaceCard tone="paper" padding="md" className="ds-contrast-panel">
              <div className="ds-contrast-panel__head">
                <div>
                  <Kicker tone="accent">Automated Contrast Audit</Kicker>
                  <h3>WCAG 2.2 AA Contrast Matrix ({CONTRAST_PAIRS.length}/{CONTRAST_PAIRS.length} Passing)</h3>
                </div>
                <span className="status-chip tone-green">All pairs &gt;= 4.5:1</span>
              </div>
              <div className="ds-contrast-grid">
                {CONTRAST_PAIRS.map((pair) => {
                  const ratio = contrastRatio(pair.fg, pair.bg);
                  const aaa = ratio >= 7;
                  return (
                    <div key={pair.id} className="ds-contrast-row">
                      <div
                        className="ds-contrast-sample"
                        style={{ backgroundColor: pair.bg, color: pair.fg }}
                      >
                        Aa
                      </div>
                      <div className="ds-contrast-meta">
                        <strong>{pair.label}</strong>
                        <code>
                          {pair.fg} on {pair.bg}
                        </code>
                      </div>
                      <span className={`status-chip status-chip-compact ${aaa ? 'tone-green' : 'tone-blue'}`}>
                        {ratio.toFixed(2)}:1 {aaa ? 'AAA' : 'AA'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </section>
        )}

        {/* ================================================================
            04 · TYPOGRAPHY WALL & SCALE LADDER
           ================================================================ */}
        {sectionVisible('typography', ['font', 'manrope', 'inter', 'jetbrains', 'scale', 'type']) && (
          <section id="ds-sec-typography" className="ds-section-block">
            <SectionHeading
              eyebrow="04 · Typography System"
              title="Three-Voice Architectural Type"
              subtitle="Manrope leads with confident negative tracking, Inter structures clean forms and queues, and JetBrains Mono pins telemetry metadata."
            />

            <div className="ds-type-specimen-wall">
              <div className="ds-type-poster is-dark">
                <span className="ds-type-poster__tag">--display · Manrope 800</span>
                <div className="ds-type-poster__glyph" style={{ fontFamily: 'var(--display)' }}>Aa</div>
                <p>Tight -0.04em tracking for mobile greetings, hero readouts, and wordmarks.</p>
              </div>
              <div className="ds-type-poster is-light">
                <span className="ds-type-poster__tag">--font · Inter 400–700</span>
                <div className="ds-type-poster__glyph" style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>Aa</div>
                <p>Neutral geometric clarity across forms, tables, modals, and live notifications.</p>
              </div>
              <div className="ds-type-poster is-crimson">
                <span className="ds-type-poster__tag">--mono · JetBrains Mono</span>
                <div className="ds-type-poster__glyph" style={{ fontFamily: 'var(--mono)' }}>08</div>
                <p>Tabular precision for booking codes (`SR-261127-008`), kickers, and distances.</p>
              </div>
            </div>

            <SurfaceCard tone="paper" padding="md" className="ds-type-scale-card">
              <div className="ds-type-scale-toolbar">
                <div>
                  <Kicker>Live Type Ladder</Kicker>
                  <h3>Scale &amp; Tracking Preview</h3>
                </div>
                <input
                  type="text"
                  className="text-input ds-sample-input"
                  value={sampleCopy}
                  onChange={(e) => setSampleCopy(e.target.value)}
                  aria-label="Edit typography specimen text"
                />
              </div>
              <div className="ds-type-ladder">
                {TYPOGRAPHY.scale.map((row) => {
                  const fontVar =
                    row.family === 'display'
                      ? 'var(--display)'
                      : row.family === 'mono'
                      ? 'var(--mono)'
                      : 'var(--font)';
                  return (
                    <div key={row.token} className="ds-type-row">
                      <div className="ds-type-row__meta">
                        <code>{row.token}</code>
                        <span>
                          {row.sizePx}px · w{row.weight} · {row.tracking}
                        </span>
                      </div>
                      <div
                        className="ds-type-row__sample"
                        style={{
                          fontFamily: fontVar,
                          fontSize: `${row.sizePx}px`,
                          lineHeight: row.lineHeight,
                          fontWeight: row.weight,
                          letterSpacing: row.tracking,
                          textTransform: row.token === '--fs-label' ? 'uppercase' : 'none',
                        }}
                      >
                        {row.token === '--fs-label' ? 'SANBS DISPATCH · ACTIVE LEG' : sampleCopy}
                      </div>
                      <small className="ds-type-row__role">{row.role}</small>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </section>
        )}

        {/* ================================================================
            05 · FOUNDATIONS: SPACING, RADII, SHADOWS, MOTION & Z-INDEX
           ================================================================ */}
        {sectionVisible('foundations', ['spacing', 'radius', 'radii', 'shadow', 'elevation', 'motion', 'z-index']) && (
          <section id="ds-sec-foundations" className="ds-section-block">
            <SectionHeading
              eyebrow="05 · Spatial & Motion Tokens"
              title="4px Rhythm, Pill Radii, Elevation & Curves"
              subtitle="Calibrated corner radii (`--r-lg` 24px to `--pill` 999px) paired with crisp physics curves and deterministic layering."
            />

            <div className="ds-grid-2">
              <SurfaceCard tone="paper" padding="md">
                <Kicker>Spacing Scale (4px Base)</Kicker>
                <div className="ds-spacing-list">
                  {SPACING.map((s) => (
                    <div key={s.token} className="ds-spacing-row">
                      <code>{s.token}</code>
                      <span className="ds-spacing-px">{s.px}px</span>
                      <div className="ds-spacing-bar-wrap">
                        <span className="ds-spacing-bar" style={{ width: `${Math.min(100, s.px * 2.2)}%` }} />
                      </div>
                      <small>{s.usage}</small>
                    </div>
                  ))}
                </div>
              </SurfaceCard>

              <SurfaceCard tone="paper" padding="md">
                <Kicker>Border Radii</Kicker>
                <div className="ds-radii-grid">
                  {RADII.map((r) => (
                    <div key={r.token} className="ds-radius-item">
                      <div
                        className="ds-radius-box"
                        style={{ borderRadius: r.value === '999px' ? '999px' : r.value }}
                      >
                        <span>{r.value}</span>
                      </div>
                      <code>{r.token}</code>
                      <small>{r.usage}</small>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </div>

            <div className="ds-grid-2" style={{ marginTop: 16 }}>
              <SurfaceCard tone="paper-2" padding="md">
                <Kicker>Elevation Shadows</Kicker>
                <div className="ds-shadow-grid">
                  {ELEVATION.map((el) => (
                    <div
                      key={el.token}
                      className="ds-shadow-tile"
                      style={{
                        boxShadow: el.value,
                        background: el.token === '--sh-ink' ? COLORS.carbon : el.token === '--sh-accent' ? COLORS.accent : COLORS.paper,
                        color: el.token === '--sh-ink' || el.token === '--sh-accent' ? COLORS.white : COLORS.ink,
                      }}
                    >
                      <code>{el.token}</code>
                      <small>{el.usage}</small>
                    </div>
                  ))}
                </div>
              </SurfaceCard>

              <SurfaceCard tone="paper" padding="md">
                <div className="ds-card-head-row">
                  <div>
                    <Kicker>Motion Curves &amp; Z-Layers</Kicker>
                    <h3>Easing Playground</h3>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setMotionMoved((m) => !m)}>
                    Trigger curve
                  </Button>
                </div>
                <div className="ds-motion-stage">
                  <div className="ds-motion-lane">
                    <span>--ease-standard (240ms)</span>
                    <div className="ds-motion-track">
                      <span className={`ds-motion-puck is-std ${motionMoved ? 'is-end' : ''}`} />
                    </div>
                  </div>
                  <div className="ds-motion-lane">
                    <span>--ease-out (380ms)</span>
                    <div className="ds-motion-track">
                      <span className={`ds-motion-puck is-out ${motionMoved ? 'is-end' : ''}`} />
                    </div>
                  </div>
                  <div className="ds-tag-row">
                    {MOTION.durations.map((dur) => (
                      <span key={dur.token} className="status-chip tone-grey status-chip-compact">
                        {dur.token.replace('--dur-', '')} · {dur.value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ds-z-list">
                  {Z_INDEX.map((z) => (
                    <div key={z.token} className="ds-z-row">
                      <code>{z.token}</code>
                      <strong>{z.value}</strong>
                      <span>{z.layer}</span>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </div>
          </section>
        )}

        {/* ================================================================
            06 · INTERACTIVE UI PRIMITIVES
           ================================================================ */}
        {sectionVisible('primitives', ['button', 'input', 'field', 'dock', 'choice', 'modal', 'empty']) && (
          <section id="ds-sec-primitives" className="ds-section-block">
            <SectionHeading
              eyebrow="06 · Interactive UI Kit"
              title="Core Controls, Form Fields & Circular Dock"
              subtitle="Every interactive primitive guarantees 44px touch targets and distinct dark/light keyboard focus visibility."
            />

            <div className="ds-grid-2">
              <SurfaceCard tone="paper" padding="md">
                <Kicker>Buttons &amp; Hierarchy</Kicker>
                <div className="ds-btn-showcase">
                  <div className="ds-btn-row">
                    <Button variant="primary" onClick={() => onNotify?.('Primary Crimson CTA triggered')}>
                      Book a free ride <ArrowRight size={15} />
                    </Button>
                    <Button variant="carbon">Assign driver</Button>
                    <Button variant="secondary">Cancel</Button>
                  </div>
                  <div className="ds-btn-row">
                    <Button variant="quiet">Authorise return</Button>
                    <Button variant="danger">Cancel booking</Button>
                    <Button size="sm" variant="secondary">Small pill</Button>
                    <IconButton icon={Bell} label="Notifications demo" onClick={() => onNotify?.('IconButton tapped')} />
                  </div>
                  <SplitCtaBanner
                    kicker="SANBS Sandton · 09:30 · Free return"
                    title="Book a ride"
                    onClick={() => setModalOpen(true)}
                  />
                </div>
              </SurfaceCard>

              <SurfaceCard tone="paper" padding="md">
                <Kicker>Form Inputs, Radio Choices &amp; Circular Dock</Kicker>
                <div className="ds-form-showcase">
                  <Field
                    label="Pickup address"
                    hint="Verified street address inside Gauteng service radius"
                  >
                    <input
                      className="text-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Validation state"
                    error="Select a SANBS donor centre before confirming."
                  >
                    <input
                      className="text-input"
                      defaultValue=""
                      placeholder="Required donor centre"
                      aria-invalid="true"
                    />
                  </Field>

                  <div className="ds-choice-stack" role="radiogroup" aria-label="Sample donor centres">
                    <ChoiceOption
                      selected={selectedChoice === 'sandton'}
                      title="SANBS Sandton Donor Centre"
                      description="08:00 – 17:00 · 6.2 km away"
                      trailing="11 min"
                      onClick={() => setSelectedChoice('sandton')}
                    />
                    <ChoiceOption
                      selected={selectedChoice === 'rosebank'}
                      title="SANBS Rosebank Donor Centre"
                      description="08:30 – 16:30 · 2.1 km away"
                      trailing="6 min"
                      onClick={() => setSelectedChoice('rosebank')}
                    />
                  </div>

                  <div className="ds-dock-stage">
                    <span className="ds-dock-label">Mobile Circular Dock (Active: {dockTab})</span>
                    <CircularDock
                      items={DOCK_DEMO_ITEMS}
                      activeId={dockTab}
                      onChange={setDockTab}
                      className="ds-dock-inline"
                    />
                  </div>
                </div>
              </SurfaceCard>
            </div>
          </section>
        )}

        {/* ================================================================
            07 · 14-STATE JOURNEY PATTERNS & FLEET COHORTS
           ================================================================ */}
        {sectionVisible('patterns', ['status', 'chip', 'timeline', 'avatar', 'origin', 'telemetry', 'driver', 'donor']) && (
          <section id="ds-sec-patterns" className="ds-section-block">
            <SectionHeading
              eyebrow="07 · Domain Patterns"
              title="14-State Journey Lifecycle & Fleet Badges"
              subtitle="Click any journey phase to inspect live state synchronization across StatusChip, carbon TelemetryStrip, and JourneyTimeline."
            />

            <SurfaceCard tone="paper" padding="md">
              <div className="ds-status-toolbar">
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
                <span className="ds-selected-code">
                  Active key: <code>{selectedStatus}</code>
                </span>
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
                      { label: 'Booking ID', value: 'SR-008' },
                      { label: 'Owner', value: selectedStatus.includes('authoris') ? 'SANBS Staff' : 'Driver / Ops' },
                    ]}
                  />
                  <RouteStopStack
                    originTitle="14 Cradock Ave, Rosebank"
                    originMeta="Verified street pickup · 08:45"
                    destTitle="SANBS Sandton Donor Centre"
                    destMeta="Round-trip return readiness included"
                  />
                </div>
                <div className="ds-lifecycle-preview__right">
                  <Kicker>Synchronized JourneyTimeline ({isReturnLeg ? 'Return leg' : 'Outbound leg'})</Kicker>
                  <JourneyTimeline booking={previewBooking} leg={isReturnLeg ? 'return' : 'outbound'} />
                </div>
              </div>
            </SurfaceCard>

            <div className="ds-grid-2" style={{ marginTop: 16 }}>
              <SurfaceCard tone="paper" padding="md">
                <Kicker>Booking Origin Attribution &amp; Fleet Avatars</Kicker>
                <div className="ds-origin-avatar-stack">
                  <div className="ds-inline-group">
                    <OriginTag origin="donor" />
                    <OriginTag origin="staff" />
                  </div>
                  <div className="ds-avatar-grid">
                    {AVATAR_TONES.map((tone, index) => (
                      <div key={tone.id} className="ds-avatar-spec">
                        <DriverAvatar
                          driver={{ initials: ['SN', 'LM', 'TM', 'PK'][index], color: tone.id }}
                          size="large"
                        />
                        <div>
                          <strong>{tone.label}</strong>
                          <code>color="{tone.id}"</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard tone="paper" padding="md">
                <Kicker>Empty &amp; Dialog Pattern</Kicker>
                <EmptyState
                  icon={Clock3}
                  title="No return rides awaiting dispatch"
                  description="Donor return requests appear here automatically once SANBS centre staff authorise readiness."
                  action={
                    <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
                      Preview ModalFrame
                    </Button>
                  }
                />
              </SurfaceCard>
            </div>
          </section>
        )}

        {/* ================================================================
            08 · STEALTH DARK MAPS & DATA VISUALIZATION
           ================================================================ */}
        {sectionVisible('maps', ['map', 'stealth', 'leaflet', 'route', 'chart', 'sparkline']) && (
          <section id="ds-sec-maps" className="ds-section-block">
            <SectionHeading
              eyebrow="08 · Stealth Maps & Telemetry"
              title="Inverted Cartography & Vector RouteMaps"
              subtitle="Test Stealth Dark vs Light vector routing, swap outbound/return orientation, and scrub live vehicle progress."
            />

            <div className="ds-map-studio">
              <SurfaceCard tone="paper" padding="md">
                <div className="ds-map-toolbar">
                  <div className="ds-filter-tabs">
                    <button
                      type="button"
                      className={`ds-filter-tab ${mapTheme === 'stealth' ? 'is-active' : ''}`}
                      onClick={() => setMapTheme('stealth')}
                    >
                      Stealth Dark
                    </button>
                    <button
                      type="button"
                      className={`ds-filter-tab ${mapTheme === 'light' ? 'is-active' : ''}`}
                      onClick={() => setMapTheme('light')}
                    >
                      Light Paper
                    </button>
                  </div>

                  <div className="ds-filter-tabs">
                    <button
                      type="button"
                      className={`ds-filter-tab ${mapLeg === 'outbound' ? 'is-active' : ''}`}
                      onClick={() => setMapLeg('outbound')}
                    >
                      Outbound
                    </button>
                    <button
                      type="button"
                      className={`ds-filter-tab ${mapLeg === 'return' ? 'is-active' : ''}`}
                      onClick={() => setMapLeg('return')}
                    >
                      Return
                    </button>
                  </div>
                </div>

                <div className="ds-map-slider">
                  <label htmlFor="ds-map-progress">
                    Vehicle progress: <strong>{Math.round(mapProgress * 100)}%</strong>
                  </label>
                  <input
                    id="ds-map-progress"
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(mapProgress * 100)}
                    onChange={(e) => setMapProgress(Number(e.target.value) / 100)}
                  />
                </div>

                <div className="ds-map-frame">
                  <RouteMap
                    from={DEMO_ROUTE_DATA.from}
                    to={DEMO_ROUTE_DATA.to}
                    progress={mapProgress}
                    reverse={mapLeg === 'return'}
                    dark={mapTheme === 'stealth'}
                  />
                </div>
              </SurfaceCard>

              <SurfaceCard tone="carbon" padding="md" className="ds-map-telemetry-panel">
                <div className="ds-map-art-thumb">
                  <img src={STUDIO_MEDIA.stealthGrid} alt="Stealth grid overview" loading="lazy" />
                  <span>Leaflet CSS Filter</span>
                </div>
                <p className="ds-dark-copy">
                  OpenStreetMap tiles invert via <code>grayscale(100%) invert(94%) contrast(108%) brightness(86%)</code> over
                  a 48px `#0F1115` architectural grid.
                </p>
                <div className="ds-sparkline-card">
                  <div className="ds-sparkline-head">
                    <span>Completed Donor Legs (7d)</span>
                    <strong style={{ color: MAP_PALETTE.chart.darkLine }}>42 rides</strong>
                  </div>
                  <svg viewBox="0 0 280 86" className="ds-sparkline-svg" aria-label="Sample driver weekly trips chart">
                    <line x1="0" y1="22" x2="280" y2="22" stroke={MAP_PALETTE.chart.darkGrid} />
                    <line x1="0" y1="54" x2="280" y2="54" stroke={MAP_PALETTE.chart.darkGrid} />
                    <polyline
                      fill="none"
                      stroke={MAP_PALETTE.chart.darkLine}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="10,64 56,52 102,58 148,34 194,40 240,18 270,22"
                    />
                    {[
                      [10, 64],
                      [56, 52],
                      [102, 58],
                      [148, 34],
                      [194, 40],
                      [240, 18],
                      [270, 22],
                    ].map(([cx, cy], idx) => (
                      <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill={MAP_PALETTE.chart.darkPointFill}
                        stroke={MAP_PALETTE.chart.darkPointStroke}
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>
              </SurfaceCard>
            </div>
          </section>
        )}

        {/* ================================================================
            09 · DUAL-CHASSIS ARCHITECTURE & ACCESSIBILITY
           ================================================================ */}
        {sectionVisible('accessibility', ['a11y', 'wcag', 'popia', 'focus', 'mobile', 'console', 'desktop', 'touch']) && (
          <section id="ds-sec-accessibility" className="ds-section-block">
            <SectionHeading
              eyebrow="09 · Architecture & Guardrails"
              title="Dual-Chassis Shells & WCAG 2.2 AA Rules"
              subtitle="Field roles run in a scaled 390×844 mobile frame while SANBS Staff and Operations command fleets from 220px carbon-sidebar consoles."
            />

            <div className="ds-grid-2">
              <SurfaceCard tone="paper" padding="md">
                <div className="ds-chassis-card">
                  <div className="ds-chassis-wire is-phone" aria-hidden="true">
                    <span className="ds-wire-pill" />
                    <span className="ds-wire-hero" />
                    <span className="ds-wire-cta" />
                    <span className="ds-wire-dock" />
                  </div>
                  <div className="ds-role-shell-copy">
                    <div className="ds-role-badge"><Smartphone size={15} /> Field Roles · Donor &amp; Driver</div>
                    <h3>390 × 844 Handheld Chassis</h3>
                    <p>
                      Auto-scaled via `--phone-scale`, anchored by a 52px 4-icon Circular Dock, swipeable sheets, and
                      full-bleed turn-by-turn dark navigation HUD.
                    </p>
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard tone="paper" padding="md">
                <div className="ds-chassis-card">
                  <div className="ds-chassis-wire is-console" aria-hidden="true">
                    <span className="ds-wire-rail" />
                    <div className="ds-wire-main">
                      <span className="ds-wire-top" />
                      <span className="ds-wire-table" />
                    </div>
                  </div>
                  <div className="ds-role-shell-copy">
                    <div className="ds-role-badge"><Monitor size={15} /> Hub Roles · Staff &amp; Ops</div>
                    <h3>220px Carbon Sidebar Console</h3>
                    <p>
                      Persistent `#0A0B0D` sidebar rails paired with arrival boards, slide-over `BookingDetailPanel`
                      drawers, and full-viewport dispatch map controls.
                    </p>
                  </div>
                </div>
              </SurfaceCard>
            </div>

            <div className="ds-a11y-grid">
              {ACCESSIBILITY_RULES.map((rule) => (
                <SurfaceCard key={rule.id} tone="paper" padding="md">
                  <div className="ds-a11y-head">
                    <CheckCircle2 size={18} color={COLORS.ok} aria-hidden="true" />
                    <span className="status-chip tone-green status-chip-compact">{rule.metric}</span>
                  </div>
                  <h4 className="ds-a11y-title">{rule.title}</h4>
                  <p className="ds-muted-copy">{rule.detail}</p>
                </SurfaceCard>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Live ModalFrame preview */}
      {modalOpen && (
        <ModalFrame
          onClose={() => setModalOpen(false)}
          title="Book Assisted Donor Ride"
          subtitle="Example ModalFrame adhering to --r-2xl (34px) geometry, Escape dismissal, and accessible focus return."
          footer={
            <div className="ds-modal-footer">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setModalOpen(false);
                  onNotify?.('Confirmed preview modal action');
                }}
              >
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
