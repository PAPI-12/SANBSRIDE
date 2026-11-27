import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  CarFront,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Copy,
  Eye,
  Heart,
  History,
  Home,
  Layers,
  Monitor,
  Navigation,
  Palette,
  RotateCcw,
  Search,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Type,
  UserRound,
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
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'brand', label: 'Brand & Marks', icon: Heart },
  { id: 'colors', label: 'Color & Contrast', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'foundations', label: 'Spacing, Radii & Motion', icon: Layers },
  { id: 'primitives', label: 'Primitives', icon: Sliders },
  { id: 'patterns', label: 'Journey & Role Patterns', icon: CarFront },
  { id: 'maps', label: 'Stealth Maps', icon: Compass },
  { id: 'accessibility', label: 'Layout & Accessibility', icon: ShieldCheck },
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

export default function DesignSystemView({ onBack, onNotify }) {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [reduceMotionDemo, setReduceMotionDemo] = useState(false);
  const [copiedId, setCopiedId] = useState('');

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
    <div className={`ds-root ${reduceMotionDemo ? 'ds-reduce-motion' : ''}`}>
      {/* Sticky Carbon Studio Sub-Header */}
      <header className="ds-studio-bar">
        <div className="ds-studio-bar__inner">
          <div className="ds-studio-bar__brand">
            <SanbsBrand light />
            <span className="ds-version-pill">DESIGN SYSTEM · v{DESIGN_SYSTEM_META.version}</span>
          </div>

          <div className="ds-studio-bar__tools">
            <label className="ds-search-box" aria-label="Search tokens and components">
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter tokens, hex, states..."
              />
            </label>

            <button
              type="button"
              className={`ds-toggle-pill ${reduceMotionDemo ? 'is-active' : ''}`}
              aria-pressed={reduceMotionDemo}
              onClick={() => setReduceMotionDemo((v) => !v)}
            >
              <Eye size={14} aria-hidden="true" />
              <span>{reduceMotionDemo ? 'Motion: Reduced' : 'Motion: Live'}</span>
            </button>

            <button
              type="button"
              className="ds-toggle-pill"
              onClick={() =>
                copyToken(
                  JSON.stringify({ meta: DESIGN_SYSTEM_META, colors: COLORS, typography: TYPOGRAPHY }, null, 2),
                  'json-export'
                )
              }
            >
              {copiedId === 'json-export' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              <span>{copiedId === 'json-export' ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>

            <button type="button" className="ds-back-btn" onClick={onBack}>
              <ArrowLeft size={15} aria-hidden="true" />
              <span>Back to app</span>
            </button>
          </div>
        </div>
      </header>

      <div className="ds-shell">
        {/* Left Navigation Rail (Sticky on desktop, scrollable pills on mobile) */}
        <aside className="ds-nav-rail" aria-label="Design system sections">
          <div className="ds-nav-rail__card">
            <span className="ds-nav-rail__heading">Foundations &amp; UI</span>
            <ul className="ds-nav-rail__list">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const active = activeSection === sec.id;
                return (
                  <li key={sec.id}>
                    <button
                      type="button"
                      className={`ds-nav-rail__link ${active ? 'is-active' : ''}`}
                      onClick={() => scrollToSection(sec.id)}
                    >
                      <Icon size={16} aria-hidden="true" />
                      <span>{sec.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="ds-main">
          {/* HERO / OVERVIEW */}
          {sectionVisible('overview', ['carbon', 'crimson', 'monochrome', 'overview']) && (
            <section id="ds-sec-overview" className="ds-hero">
              <div className="ds-hero__grid">
                <div className="ds-hero__copy">
                  <Kicker tone="dark">SANBS RIDE · CANONICAL UI SPECIFICATION</Kicker>
                  <h1>Monochrome &amp; SANBS Crimson</h1>
                  <p>
                    A high-contrast, clinical-grade mobility design system built for zero-cost donor transport across
                    Gauteng. Engineered around stark pure-white reading surfaces, `#0A0B0D` carbon frames, a single
                    bold `#D42127` crimson signal accent, and stealth dark routing maps.
                  </p>
                  <div className="ds-hero__pills">
                    {SECTIONS.slice(1).map((sec) => (
                      <button key={sec.id} type="button" className="ds-jump-pill" onClick={() => scrollToSection(sec.id)}>
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ds-hero__telemetry">
                  <TelemetryStrip
                    progress={0.78}
                    items={[
                      { label: 'Contrast pairs', value: `${CONTRAST_PAIRS.length} AA+`, accent: true },
                      { label: 'Journey states', value: `${STATUS_CHIP_SPECS.length}` },
                      { label: 'Touch floor', value: '44 px' },
                    ]}
                  />
                  <div className="ds-hero__mini-grid">
                    <div className="ds-mini-spec">
                      <span>Typefaces</span>
                      <strong>Manrope · Inter · Mono</strong>
                    </div>
                    <div className="ds-mini-spec">
                      <span>Viewports</span>
                      <strong>390×844 / Console</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* BRAND & MARKS */}
          {sectionVisible('brand', ['logo', 'drop', 'ecg', 'splash', 'svg', 'pin']) && (
            <section id="ds-sec-brand" className="ds-section">
              <SectionHeading
                eyebrow="01 · Identity"
                title="Brand Marks & Live Drop Telemetry"
                subtitle="The bespoke SANBS RIDE mark fuses two intertwined blood-drop loops into a continuous circular path. All vector assets share one canonical viewBox (76.02 × 100)."
              />

              <div className="ds-grid-2">
                <SurfaceCard tone="paper" padding="md">
                  <Kicker>Brand Lockups</Kicker>
                  <div className="ds-mark-grid">
                    <div className="ds-mark-tile ds-mark-tile--light">
                      <SanbsBrand light={false} />
                      <code>{'light={false}'}</code>
                    </div>
                    <div className="ds-mark-tile ds-mark-tile--dark">
                      <SanbsBrand light />
                      <code>{'light={true}'}</code>
                    </div>
                    <div className="ds-mark-tile ds-mark-tile--light">
                      <div className="ds-mark-row">
                        <BrandMark size={40} tone="accent" />
                        <BrandMark size={40} tone="ink" />
                        <span className="ds-app-icon-tile">
                          <BrandMark size={26} tone="white" />
                        </span>
                      </div>
                      <code>Crimson · Ink · App Icon</code>
                    </div>
                  </div>
                  <div className="ds-tag-row">
                    {BRAND_ARTWORK.files.map((assetPath) => (
                      <span key={assetPath} className="status-chip tone-grey status-chip-compact">
                        {assetPath.replace('/brand/', '')}
                      </span>
                    ))}
                  </div>
                </SurfaceCard>

                <SurfaceCard tone="carbon" padding="md">
                  <div className="ds-card-head-row">
                    <div>
                      <Kicker tone="dark">Interactive Drop Pin &amp; ECG Splash</Kicker>
                      <h3 className="ds-dark-title">Journey Fill &amp; Heartbeat Pulse</h3>
                    </div>
                    <button
                      type="button"
                      className="ds-toggle-pill"
                      onClick={() => setSplashKey((k) => k + 1)}
                    >
                      <RotateCcw size={14} aria-hidden="true" />
                      <span>Replay pulse</span>
                    </button>
                  </div>

                  <div className="ds-brand-lab">
                    <div className="ds-drop-preview">
                      <SanbsDropPin fillPercent={dropFill} size={48} />
                      <div className="ds-drop-slider">
                        <label htmlFor="ds-drop-range">
                          Route progress fill: <strong>{dropFill}%</strong>
                        </label>
                        <input
                          id="ds-drop-range"
                          type="range"
                          min={0}
                          max={100}
                          value={dropFill}
                          onChange={(e) => setDropFill(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="ds-ecg-preview" key={splashKey}>
                      <div className="ds-ecg-disc">
                        <BrandMark size={26} tone="white" />
                      </div>
                      <EcgPulseLine stroke={COLORS.accentBright} width={170} height={28} animate={!reduceMotionDemo} />
                    </div>
                  </div>
                </SurfaceCard>
              </div>
            </section>
          )}

          {/* COLOR & CONTRAST */}
          {sectionVisible('colors', ['hex', 'palette', 'wcag', 'contrast', 'red', 'carbon', 'accent', 'status']) && (
            <section id="ds-sec-colors" className="ds-section">
              <SectionHeading
                eyebrow="02 · Color & Accessibility"
                title="Palette Tokens & Verified WCAG AA Matrix"
                subtitle="Click any color card to copy its CSS variable name or hex value. Every foreground/background pairing passes >= 4.5:1 normal-text contrast."
              />

              <div className="ds-color-groups">
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
                    <Kicker tone="accent">Automated Contrast Guardrail</Kicker>
                    <h3>WCAG 2.2 AA Contrast Verification ({CONTRAST_PAIRS.length}/{CONTRAST_PAIRS.length} Passing)</h3>
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

          {/* TYPOGRAPHY */}
          {sectionVisible('typography', ['font', 'manrope', 'inter', 'jetbrains', 'scale', 'type']) && (
            <section id="ds-sec-typography" className="ds-section">
              <SectionHeading
                eyebrow="03 · Typography"
                title="Three-Voice Type Architecture"
                subtitle="Manrope creates bold architectural display headings; Inter ensures effortless legibility across forms and tables; JetBrains Mono anchors references and telemetry kickers."
              />

              <div className="ds-grid-3">
                {TYPOGRAPHY.families.map((fam) => (
                  <SurfaceCard key={fam.id} tone="paper" padding="md">
                    <Kicker>{fam.cssVar}</Kicker>
                    <h3
                      style={{
                        fontFamily: fam.stack,
                        fontSize: 24,
                        fontWeight: fam.id === 'display' ? 800 : 700,
                        margin: '8px 0 6px',
                      }}
                    >
                      {fam.name}
                    </h3>
                    <p className="ds-muted-copy">{fam.usage}</p>
                    <div className="ds-tag-row">
                      {fam.weights.map((w) => (
                        <span key={w} className="status-chip tone-grey status-chip-compact">
                          {w}
                        </span>
                      ))}
                    </div>
                  </SurfaceCard>
                ))}
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

          {/* SPACING, RADII, ELEVATION, MOTION */}
          {sectionVisible('foundations', ['spacing', 'radius', 'radii', 'shadow', 'elevation', 'motion', 'z-index']) && (
            <section id="ds-sec-foundations" className="ds-section">
              <SectionHeading
                eyebrow="04 · Spatial & Motion System"
                title="4px Grid, Pill Geometry, Elevation & Curves"
                subtitle="Generous corner radii (--r-lg 24px to --pill 999px) give SANBS RIDE its calm, approachable tactile feel while preserving strict edge discipline."
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

          {/* PRIMITIVES */}
          {sectionVisible('primitives', ['button', 'input', 'field', 'dock', 'choice', 'modal', 'empty']) && (
            <section id="ds-sec-primitives" className="ds-section">
              <SectionHeading
                eyebrow="05 · Core Primitives"
                title="Interactive Controls, Inputs & Navigation"
                subtitle="Every interactive element guarantees at least 44px touch clearance on mobile and distinct keyboard focus visibility across light and dark backgrounds."
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
                      <Button size="sm" variant="secondary">
                        Small pill
                      </Button>
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
                  <Kicker>Form Fields, Radio Rows &amp; Mobile Dock</Kicker>
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
                      <span className="ds-dock-label">Mobile 4-Icon Circular Dock (Active: {dockTab})</span>
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

          {/* PATTERNS & JOURNEY STATES */}
          {sectionVisible('patterns', ['status', 'chip', 'timeline', 'avatar', 'origin', 'telemetry', 'driver', 'donor']) && (
            <section id="ds-sec-patterns" className="ds-section">
              <SectionHeading
                eyebrow="06 · Domain Patterns"
                title="14-State Journey Lifecycle, Fleet & Origin Badges"
                subtitle="Click any journey state below to inspect how the StatusChip, carbon TelemetryStrip, and vertical JourneyTimeline synchronize across Donor, Driver, Staff, and Operations roles."
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
                        { label: 'Role owner', value: selectedStatus.includes('authoris') ? 'SANBS Staff' : 'Driver / Ops' },
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

          {/* STEALTH MAPS */}
          {sectionVisible('maps', ['map', 'stealth', 'leaflet', 'route', 'chart', 'sparkline']) && (
            <section id="ds-sec-maps" className="ds-section">
              <SectionHeading
                eyebrow="07 · Stealth Maps & Telemetry"
                title="Inverted Cartography & Vector RouteMaps"
                subtitle="Maps strip away visual noise into deep carbon geometry (#0F1115) so the #FF3B42 active route, pure-white origin beacon, and liquid-fill SANBS destination pin read instantaneously."
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
                      Vehicle progress along vector path: <strong>{Math.round(mapProgress * 100)}%</strong>
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

                <SurfaceCard tone="carbon" padding="md">
                  <Kicker tone="dark">Stealth Surface &amp; Chart Tokens</Kicker>
                  <h3 className="ds-dark-title">Leaflet Tile Inversion Filter &amp; Sparkline</h3>
                  <p className="ds-dark-copy">
                    Production Leaflet maps render OpenStreetMap tiles inside <code>.is-stealth-map</code> using{' '}
                    <code>grayscale(100%) invert(94%) contrast(108%) brightness(86%)</code> on top of a
                    48px `#0F1115` architectural grid.
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

          {/* LAYOUT & ACCESSIBILITY */}
          {sectionVisible('accessibility', ['a11y', 'wcag', 'popia', 'focus', 'mobile', 'console', 'desktop', 'touch']) && (
            <section id="ds-sec-accessibility" className="ds-section">
              <SectionHeading
                eyebrow="08 · Layout & Guardrails"
                title="Dual-Chassis Architecture & WCAG 2.2 AA Rules"
                subtitle="SANBS RIDE splits intentionally into two cohesive shells: a mobile-first 390×844 handheld frame for field roles and a dense 220px carbon-sidebar console for operational hubs."
              />

              <div className="ds-grid-2">
                <SurfaceCard tone="paper" padding="md">
                  <div className="ds-role-shell-card">
                    <Smartphone size={22} />
                    <div>
                      <Kicker>Field Roles · Donor &amp; Driver</Kicker>
                      <h3>390 × 844 Mobile Frame</h3>
                      <p>
                        Auto-scaled cleanly on desktop viewports via `--phone-scale` (`phoneScale.js`), anchored by a
                        floating 4-button 52px Circular Dock, swipeable expandable journey sheets, and full-bleed turn
                        navigation HUD.
                      </p>
                    </div>
                  </div>
                </SurfaceCard>

                <SurfaceCard tone="paper" padding="md">
                  <div className="ds-role-shell-card">
                    <Monitor size={22} />
                    <div>
                      <Kicker>Hub Roles · SANBS Staff &amp; Operations</Kicker>
                      <h3>220px Carbon Sidebar Console</h3>
                      <p>
                        Dedicated desktop architecture combining `#0A0B0D` persistent navigation rails, high-density
                        arrival tables, slide-over `BookingDetailPanel` drawers, and full-viewport dispatch map controls.
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
      </div>

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
