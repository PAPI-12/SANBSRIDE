import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  Eye,
  EyeOff,
  Heart,
  LifeBuoy,
  MapPin,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { BrandMark } from './Shared.jsx';

const HERO_ROUTE_POINTS = [
  [54, 152],
  [114, 126],
  [184, 124],
  [248, 96],
  [314, 70],
  [382, 44],
];

function pointAlongHeroRoute(points, progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  const lengths = points.slice(1).map((end, index) => {
    const start = points[index];
    return Math.hypot(end[0] - start[0], end[1] - start[1]);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  let remaining = clamped * total;
  for (let index = 0; index < lengths.length; index += 1) {
    const segLen = lengths[index];
    if (remaining <= segLen || index === lengths.length - 1) {
      const ratio = segLen ? Math.min(remaining / segLen, 1) : 0;
      const start = points[index];
      const end = points[index + 1];
      const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * (180 / Math.PI);
      return {
        x: start[0] + (end[0] - start[0]) * ratio,
        y: start[1] + (end[1] - start[1]) * ratio,
        angle,
      };
    }
    remaining -= segLen;
  }
  const last = points[points.length - 1];
  return { x: last[0], y: last[1], angle: -22 };
}

function AnimatedOpeningRoute() {
  const [progress, setProgress] = useState(0.62);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setProgress(0.62);
      return undefined;
    }
    let frameId = 0;
    const cycleMs = 8800;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = (now - startTime) % cycleMs;
      const t = elapsed / cycleMs;
      const eased = t < 0.84 ? t / 0.84 : 1;
      const smooth = eased < 0.5
        ? 2 * eased * eased
        : 1 - Math.pow(-2 * eased + 2, 2) / 2;
      setProgress(0.08 + smooth * 0.86);
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const marker = pointAlongHeroRoute(HERO_ROUTE_POINTS, progress);
  const pathString = `M ${HERO_ROUTE_POINTS.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
  const start = HERO_ROUTE_POINTS[0];
  const end = HERO_ROUTE_POINTS[HERO_ROUTE_POINTS.length - 1];
  const etaMins = Math.max(1, Math.round(5 - progress * 4));
  const distKm = (2.1 - progress * 1.9).toFixed(1);
  const phaseLabel = progress < 0.35 ? 'DISPATCHED' : progress < 0.78 ? 'EN ROUTE' : 'ARRIVING';
  const fillY = 26 * (1 - progress);

  return (
    <div className="auth-hero-preview" aria-label="Live Gauteng transport preview">
      <div className="auth-hero-preview-head">
        <div>
          <small>LIVE ROUTE TELEMETRY · SANDTON</small>
          <strong>22 West Street → SANBS Sandton Donor Centre</strong>
        </div>
        <span className="auth-live-pill"><i /> {phaseLabel}</span>
      </div>

      <div className="auth-hero-canvas">
        <svg viewBox="0 0 440 190" role="img" aria-label="Animated Sandton donor transport route">
          <defs>
            <linearGradient id="auth-route-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF7A7E" />
              <stop offset="55%" stopColor="#FF3B42" />
              <stop offset="100%" stopColor="#D42127" />
            </linearGradient>
            <clipPath id="auth-drop-clip">
              <path d="M12 1C12 1 3 11.8 3 17.8a9 9 0 0 0 18 0C21 11.8 12 1 12 1Z" />
            </clipPath>
          </defs>

          <rect width="440" height="190" fill="#0E1015" />

          <g fill="#151821" stroke="#1E232E" strokeWidth="0.9">
            <path d="M12 10h68v38H12zM102 8h58v42h-58zM182 10h48v36h-48zM254 8h74v40h-74zM352 10h74v46h-74z" />
            <path d="M14 74h54v38H14zM92 70h72v44H92zM186 66h44v48h-44zM250 72h66v42h-66zM340 72h82v38h-82z" />
            <path d="M10 136h74v44H10zM106 140h68v42h-68zM200 142h70v40h-70zM294 138h48v44h-48zM366 134h62v46h-62z" />
          </g>

          <g fill="none" stroke="#1C212C" strokeWidth="7" strokeLinecap="round">
            <path d="M0 60h440M0 128h440M84 0v190M172 0v190M242 0v190M328 0v190" />
            <path d="M-12 182 138 0M298 196 418 0" />
          </g>
          <g fill="none" stroke="#272D3B" strokeWidth="0.8">
            <path d="M0 60h440M0 128h440M84 0v190M172 0v190M242 0v190M328 0v190" />
          </g>

          <g fill="#4E5668" fontFamily="Inter, Arial, sans-serif" fontSize="6.8" fontWeight="600" opacity=".88">
            <text x="98" y="56">Rivonia Road</text>
            <text x="250" y="124">Grayston Drive</text>
            <text x="179" y="75" transform="rotate(-35 179 75)">Sandton Drive</text>
          </g>

          <path d={pathString} fill="none" stroke="#2A303E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathString} fill="none" stroke="#FF3B42" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" opacity=".16" />
          <path
            className="auth-route-stream"
            d={pathString}
            fill="none"
            stroke="#FF7A7E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 10"
          />
          <path
            d={pathString}
            fill="none"
            stroke="url(#auth-route-grad)"
            strokeWidth="4.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray={`${Math.max(progress * 100, 6)} 100`}
          />

          <circle className="auth-map-radar" cx={start[0]} cy={start[1]} r="13" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx={start[0]} cy={start[1]} r="5.5" fill="#FFFFFF" stroke="#0E1015" strokeWidth="2" />

          <circle className="auth-map-radar is-crimson" cx={end[0]} cy={end[1]} r="16" fill="none" stroke="#FF4D53" strokeWidth="1.6" />
          <g transform={`translate(${end[0] - 12} ${end[1] - 21})`}>
            <path d="M12 1C12 1 3 11.8 3 17.8a9 9 0 0 0 18 0C21 11.8 12 1 12 1Z" fill="#181C24" />
            <rect x="0" y={fillY} width="24" height="28" fill="#D42127" clipPath="url(#auth-drop-clip)" />
            <path d="M12 1C12 1 3 11.8 3 17.8a9 9 0 0 0 18 0C21 11.8 12 1 12 1Z" fill="none" stroke="#FFFFFF" strokeWidth="1.4" />
          </g>

          <g transform={`translate(${marker.x} ${marker.y})`}>
            <circle className="auth-car-halo" r="14" fill="#FF3B42" opacity=".25" />
            <circle r="8.5" fill="#FFFFFF" stroke="#0A0B0D" strokeWidth="2.2" />
            <g transform={`rotate(${marker.angle + 90})`}>
              <path d="M0 -4.2 L3.2 3.2 L0 1.4 L-3.2 3.2 Z" fill="#D42127" />
            </g>
          </g>
        </svg>

        <div className="auth-hero-telemetry" aria-hidden="true">
          <span><b>ETA</b> {etaMins} min</span>
          <span><b>DIST</b> {distKm} km</span>
          <span className="is-sync"><Navigation size={11} /> Live sync</span>
        </div>
      </div>

      <div className="auth-hero-stops">
        <span><MapPin size={13} /> Verified Sandown pickup</span>
        <span>4 connected workspaces</span>
      </div>
    </div>
  );
}

const WORKSPACES = [
  {
    id: 'donor',
    label: 'Donor',
    shortLabel: 'Donor',
    demoName: 'Thabo Mokoena',
    demoEmail: 'thabo.mokoena@example.co.za',
    hint: 'Book & track your ride',
    Icon: Heart,
    bullets: [
      'Schedule free door-to-centre rides around your SANBS appointment',
      'Track your assigned driver live with real-time arrival updates',
      'Request authorised return transport once your donation is complete',
    ],
  },
  {
    id: 'driver',
    label: 'Driver',
    shortLabel: 'Driver',
    demoName: 'James Peterson',
    demoEmail: 'james.peterson@sanbsride.example.za',
    hint: 'Turn-by-turn navigation',
    Icon: Car,
    bullets: [
      'Acknowledge or accept assigned trips straight from your shift queue',
      'Follow locked turn-by-turn routing to donor pickups and SANBS centres',
      'Confirm pickup and arrival milestones in real time across every desk',
    ],
  },
  {
    id: 'staff',
    label: 'SANBS Staff',
    shortLabel: 'Staff',
    demoName: 'Sam Ndlovu',
    demoEmail: 'sam.ndlovu@sanbs.org.example',
    hint: 'Arrivals & return sign-off',
    Icon: LifeBuoy,
    bullets: [
      'Monitor incoming donors and book staff-assisted transport requests',
      'Confirm donor arrivals cleanly without storing clinical data',
      'Authorise return trips as soon as the donor is ready to head home',
    ],
  },
  {
    id: 'operations',
    label: 'Transport Ops',
    shortLabel: 'Ops',
    demoName: 'Thandi Nkosi',
    demoEmail: 'thandi.nkosi@sanbsride.example.za',
    hint: 'Live fleet dispatch',
    Icon: ShieldCheck,
    bullets: [
      'View active routes across Gauteng on the live dark dispatch map',
      'Assign fleet, independent, or partner drivers within target pickup ETA',
      'Track and resolve transport exceptions before they delay a donation',
    ],
  },
];

function getWorkspace(role) {
  return WORKSPACES.find((item) => item.id === role) || WORKSPACES[0];
}

export function AuthFlow({
  screen = 'welcome',
  defaultRole = 'donor',
  registeredAccounts = [],
  onNavigate,
  onEnterDemo,
  onLogin,
  onSignup,
  onToast,
}) {
  const [role, setRole] = useState(defaultRole);
  const [signupRole, setSignupRole] = useState(defaultRole === 'driver' ? 'driver' : 'donor');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [registration, setRegistration] = useState('');
  const [driverType, setDriverType] = useState('independent');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [signupError, setSignupError] = useState('');

  const activeWorkspace = useMemo(
    () => getWorkspace(screen === 'signup' ? signupRole : role),
    [screen, signupRole, role],
  );

  const switchScreen = (nextScreen) => {
    setLoginError('');
    setSignupError('');
    onNavigate(nextScreen);
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setLoginError('');
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setLoginError('Enter your email address, mobile number, or name.');
      return;
    }
    if (password.trim().length < 4) {
      setLoginError('Enter your password (at least 4 characters).');
      return;
    }
    const matchedAccount = registeredAccounts.find((account) => {
      const target = trimmedId.toLowerCase();
      return account.role === role && (
        account.email?.toLowerCase() === target
        || account.phone?.replace(/\s+/g, '') === target.replace(/\s+/g, '')
        || account.name?.toLowerCase() === target
      );
    });
    if (matchedAccount && matchedAccount.password && matchedAccount.password !== password) {
      setLoginError('That password does not match the registered account.');
      return;
    }
    onLogin({
      role,
      identifier: trimmedId,
      account: matchedAccount || null,
    });
  };

  const handleSignupSubmit = (event) => {
    event.preventDefault();
    setSignupError('');
    if (fullName.trim().length < 2) {
      setSignupError('Enter your full name to create an account.');
      return;
    }
    if (phone.trim().length < 7) {
      setSignupError('Enter a valid mobile contact number.');
      return;
    }
    if (!email.trim().includes('@')) {
      setSignupError('Enter a valid email address.');
      return;
    }
    if (signupRole === 'donor' && pickupAddress.trim().length < 4) {
      setSignupError('Enter your regular pickup address or suburb.');
      return;
    }
    if (signupRole === 'driver' && (vehicle.trim().length < 2 || registration.trim().length < 3)) {
      setSignupError('Enter your vehicle model and registration plate.');
      return;
    }
    if (signupPassword.trim().length < 6) {
      setSignupError('Choose a password with at least 6 characters.');
      return;
    }
    if (!acceptedTerms) {
      setSignupError('Confirm the transport and privacy acknowledgment to continue.');
      return;
    }
    onSignup({
      role: signupRole,
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      pickupAddress: pickupAddress.trim(),
      vehicle: vehicle.trim(),
      registration: registration.trim().toUpperCase(),
      driverType,
      password: signupPassword,
    });
  };

  const useDemoCredentials = () => {
    setLoginError('');
    setIdentifier(activeWorkspace.demoEmail);
    setPassword('sanbs-demo');
    onEnterDemo(role);
  };

  return (
    <div className="auth-shell">
      <section className={`auth-stage${screen === 'welcome' ? ' is-welcome' : ''}`} aria-label="SANBS RIDE overview">
        <div className="auth-stage-top">
          <div className="auth-brand-lockup">
            <span className="auth-brand-beacon" aria-hidden="true">
              <span className="auth-brand-ring" />
              <BrandMark size={28} tone="white" />
            </span>
            <span className="brand-word">RIDE</span>
          </div>
          <span className="auth-stage-badge"><i /> GAUTENG · LIVE COORDINATION</span>
        </div>

        {screen === 'welcome' ? (
          <div className="auth-stage-body">
            <div className="auth-stage-copy">
              <div className="auth-eyebrow-pulse">
                <span className="eyebrow">DONOR TRANSPORT PLATFORM</span>
                <svg className="auth-ecg-trace" viewBox="0 0 112 22" width="112" height="22" aria-hidden="true">
                  <path
                    className="auth-ecg-base"
                    d="M0 11h26l6-7 6 14 5-11 4 4h65"
                    fill="none"
                    stroke="rgba(255, 77, 83, .22)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    className="auth-ecg-signal"
                    d="M0 11h26l6-7 6 14 5-11 4 4h65"
                    fill="none"
                    stroke="#FF4D53"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="auth-hero-title">
                Every blood donation deserves a <span>reliable ride.</span>
              </h1>
              <p className="auth-hero-lead">
                Seamless door-to-centre mobility connecting SANBS blood donors, verified drivers, clinic staff, and live fleet dispatch.
              </p>
            </div>

            <AnimatedOpeningRoute />

            <div className="auth-stage-stats" aria-label="Network coverage">
              <div><strong>28+</strong><span>Gauteng centres</span></div>
              <div><strong>4</strong><span>Role workspaces</span></div>
              <div><strong>Zero</strong><span>Clinical data stored</span></div>
            </div>
          </div>
        ) : (
          <div className="auth-stage-body auth-stage-role-body">
            <div className="auth-stage-copy">
              <span className="eyebrow">{activeWorkspace.label.toUpperCase()} WORKSPACE</span>
              <h2 className="auth-stage-role-title">{activeWorkspace.hint}.</h2>
              <p className="auth-hero-lead">
                {screen === 'login'
                  ? `Sign in as ${activeWorkspace.label} to view synced trip timelines, live GPS routing, and status updates across Gauteng.`
                  : `Register as a ${signupRole === 'driver' ? 'verified driver' : 'SANBS donor'} to get started right away.`}
              </p>
            </div>

            <ul className="auth-role-bullets">
              {activeWorkspace.bullets.map((bullet) => (
                <li key={bullet}>
                  <span className="auth-bullet-check" aria-hidden="true"><Check size={14} /></span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="auth-stage-trust">
              <ShieldCheck size={16} />
              <span>Transport coordination only · no clinical or medical records are stored in SANBS RIDE.</span>
            </div>
          </div>
        )}
      </section>

      <main className="auth-panel">
        {screen === 'welcome' && (
          <div className="auth-card is-welcome">
            <div className="auth-card-head">
              <span className="eyebrow">WELCOME TO SANBS RIDE</span>
              <h2>Get started</h2>
              <p>Sign in to your workspace, register a new account, or step straight into a live demo profile.</p>
            </div>

            <div className="auth-primary-actions">
              <button type="button" className="button button-primary button-wide auth-cta-shine" onClick={() => switchScreen('login')}>
                Sign in <ArrowRight size={16} />
              </button>
              <button type="button" className="button button-carbon button-wide" onClick={() => switchScreen('signup')}>
                Create account
              </button>
            </div>

            <div className="auth-divider"><span>OR LAUNCH A DEMO WORKSPACE</span></div>

            <div className="auth-demo-grid" role="group" aria-label="Quick demo workspace launch">
              {WORKSPACES.map(({ id, label, demoName, hint, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className="auth-demo-tile"
                  onClick={() => onEnterDemo(id)}
                >
                  <span className="auth-demo-icon" aria-hidden="true"><Icon size={17} /></span>
                  <span className="auth-demo-copy">
                    <strong>{label}</strong>
                    <small>{demoName} · {hint}</small>
                  </span>
                  <ArrowRight size={15} className="auth-demo-arrow" aria-hidden="true" />
                </button>
              ))}
            </div>

            <p className="auth-footnote">
              <ShieldCheck size={14} />
              <span>Real-time updates stay synchronised across Donor, Driver, Staff, and Operations views.</span>
            </p>
          </div>
        )}

        {screen === 'login' && (
          <div className="auth-card">
            <div className="auth-nav-row">
              <button type="button" className="screen-back-link" onClick={() => switchScreen('welcome')}>
                <ArrowLeft size={15} /> Opening screen
              </button>
              <button type="button" className="text-action" onClick={() => switchScreen('signup')}>
                Create account
              </button>
            </div>

            <div className="auth-card-head">
              <span className="eyebrow">SIGN IN</span>
              <h1>Welcome back</h1>
              <p>Select your workspace and enter your credentials to continue.</p>
            </div>

            <div className="auth-role-tabs" role="radiogroup" aria-label="Select workspace">
              {WORKSPACES.map(({ id, shortLabel, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={role === id}
                  className={`auth-role-tab${role === id ? ' is-selected' : ''}`}
                  onClick={() => {
                    setRole(id);
                    setLoginError('');
                  }}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{shortLabel}</span>
                </button>
              ))}
            </div>

            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <label className="field">
                <span className="field-label">Email or mobile number</span>
                <input
                  className="text-input"
                  type="text"
                  autoComplete="username"
                  placeholder={activeWorkspace.demoEmail}
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </label>

              <label className="field">
                <div className="auth-label-row">
                  <span className="field-label">Password</span>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => onToast?.(`Demo access: click "Continue as ${activeWorkspace.demoName}" below or enter any 4+ character password.`)}
                  >
                    Need help?
                  </button>
                </div>
                <div className="auth-password-wrap">
                  <input
                    className="text-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              {loginError && (
                <div className="auth-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{loginError}</span>
                </div>
              )}

              <button type="submit" className="button button-primary button-wide">
                Sign in to {activeWorkspace.label} <ArrowRight size={16} />
              </button>
            </form>

            <div className="auth-divider"><span>QUICK DEMO ACCESS</span></div>

            <button type="button" className="button button-secondary button-wide" onClick={useDemoCredentials}>
              <Sparkles size={15} /> Continue as {activeWorkspace.demoName} ({activeWorkspace.label})
            </button>

            <p className="auth-switch-line">
              New to SANBS RIDE?{' '}
              <button type="button" className="text-action" onClick={() => switchScreen('signup')}>
                Create a Donor or Driver account
              </button>
            </p>
          </div>
        )}

        {screen === 'signup' && (
          <div className="auth-card">
            <div className="auth-nav-row">
              <button type="button" className="screen-back-link" onClick={() => switchScreen('welcome')}>
                <ArrowLeft size={15} /> Opening screen
              </button>
              <button type="button" className="text-action" onClick={() => switchScreen('login')}>
                Sign in
              </button>
            </div>

            <div className="auth-card-head">
              <span className="eyebrow">REGISTRATION</span>
              <h1>Create account</h1>
              <p>Register for door-to-centre donor pickups or driver dispatch across Gauteng.</p>
            </div>

            <div className="auth-role-tabs auth-role-tabs-two" role="radiogroup" aria-label="Account type">
              {[
                { id: 'donor', label: 'Donor account', Icon: Heart },
                { id: 'driver', label: 'Driver account', Icon: Car },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={signupRole === id}
                  className={`auth-role-tab${signupRole === id ? ' is-selected' : ''}`}
                  onClick={() => {
                    setSignupRole(id);
                    setRole(id);
                    setSignupError('');
                  }}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <form className="auth-form" onSubmit={handleSignupSubmit} noValidate>
              <label className="field">
                <span className="field-label">Full name</span>
                <input
                  className="text-input"
                  type="text"
                  autoComplete="name"
                  placeholder={signupRole === 'driver' ? 'e.g. Kagiso Molefe' : 'e.g. Naledi Khumalo'}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>

              <div className="auth-form-row">
                <label className="field">
                  <span className="field-label">Mobile number</span>
                  <input
                    className="text-input"
                    type="tel"
                    autoComplete="tel"
                    placeholder="082 555 0198"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Email address</span>
                  <input
                    className="text-input"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.co.za"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
              </div>

              {signupRole === 'donor' ? (
                <label className="field">
                  <span className="field-label">Default pickup address</span>
                  <input
                    className="text-input"
                    type="text"
                    autoComplete="street-address"
                    placeholder="22 West Street, Sandown, Sandton"
                    value={pickupAddress}
                    onChange={(event) => setPickupAddress(event.target.value)}
                  />
                </label>
              ) : (
                <>
                  <div className="auth-form-row">
                    <label className="field">
                      <span className="field-label">Vehicle model</span>
                      <input
                        className="text-input"
                        type="text"
                        placeholder="Toyota Corolla"
                        value={vehicle}
                        onChange={(event) => setVehicle(event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">Registration</span>
                      <input
                        className="text-input"
                        type="text"
                        placeholder="JHB 482 GP"
                        value={registration}
                        onChange={(event) => setRegistration(event.target.value)}
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span className="field-label">Driver classification</span>
                    <select
                      className="text-input"
                      value={driverType}
                      onChange={(event) => setDriverType(event.target.value)}
                    >
                      <option value="independent">Independent approved driver</option>
                      <option value="sanbs">SANBS employed fleet driver</option>
                    </select>
                  </label>
                </>
              )}

              <label className="field">
                <span className="field-label">Create password</span>
                <div className="auth-password-wrap">
                  <input
                    className="text-input"
                    type={showSignupPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowSignupPassword((visible) => !visible)}
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />
                <span>
                  {signupRole === 'driver'
                    ? 'I confirm my driver licence and vehicle registration are valid for SANBS donor transport.'
                    : 'I understand SANBS RIDE coordinates transport only and never stores medical or clinical donor data.'}
                </span>
              </label>

              {signupError && (
                <div className="auth-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{signupError}</span>
                </div>
              )}

              <button type="submit" className="button button-primary button-wide">
                Create {signupRole === 'driver' ? 'driver' : 'donor'} account <ArrowRight size={16} />
              </button>
            </form>

            <p className="auth-switch-line">
              SANBS staff or Operations desk?{' '}
              <button
                type="button"
                className="text-action"
                onClick={() => {
                  setRole('staff');
                  switchScreen('login');
                }}
              >
                Sign in with desk access
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
