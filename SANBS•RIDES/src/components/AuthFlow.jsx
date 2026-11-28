import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Car,
  Eye,
  EyeOff,
  Heart,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BrandMark } from './Shared.jsx';
import { BRAND_ARTWORK } from '../design-system/tokens.js';

// Pure wave bands for the shared red "sea" stage: one smooth period per 720
// units, tiled 4× so the -50% drift loop tiles seamlessly.
const waveBand = (y, lift) =>
  `M0 ${y} Q 180 ${y - lift} 360 ${y} T 720 ${y} T 1080 ${y} T 1440 ${y} T 1800 ${y} T 2160 ${y} T 2520 ${y} T 2880 ${y} V320 H0 Z`;

/* One continuous SANBS-Red sea shared by BOTH auth screens. It is mounted once
   inside AuthFlow, so the waves never restart between splash and Sign in —
   the hand-off is a true continuation, not a swap. */
function AuthStageWaves() {
  return (
    <div className="auth-stage-waves" aria-hidden="true">
      <svg className="auth-stage-wave is-slow" viewBox="0 0 2880 320" preserveAspectRatio="none">
        <path d={waveBand(196, 64)} />
      </svg>
      <svg className="auth-stage-wave is-mid" viewBox="0 0 2880 320" preserveAspectRatio="none">
        <path d={waveBand(216, 54)} />
      </svg>
      <svg className="auth-stage-wave is-fast" viewBox="0 0 2880 320" preserveAspectRatio="none">
        <path d={waveBand(238, 44)} />
      </svg>
    </div>
  );
}

const WORKSPACES = [
  {
    id: 'donor',
    label: 'Donor',
    demoName: 'Thabo Mokoena',
    demoEmail: 'thabo.mokoena@example.co.za',
    Icon: Heart,
  },
  {
    id: 'driver',
    label: 'Driver',
    demoName: 'James Peterson',
    demoEmail: 'james.peterson@sanbsride.example.za',
    Icon: Car,
  },
  {
    id: 'staff',
    label: 'Staff',
    demoName: 'Sam Ndlovu',
    demoEmail: 'sam.ndlovu@sanbs.org.example',
    Icon: LifeBuoy,
  },
  {
    id: 'operations',
    label: 'Ops',
    demoName: 'Thandi Nkosi',
    demoEmail: 'thandi.nkosi@sanbsride.example.za',
    Icon: ShieldCheck,
  },
];

function getWorkspace(role) {
  return WORKSPACES.find((item) => item.id === role) || WORKSPACES[0];
}

function LogoSplashScreen({ onComplete }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const holdMs = reduced ? 650 : 2300;
    const exitMs = reduced ? 200 : 460;
    let doneTimer = 0;
    const fadeTimer = window.setTimeout(() => {
      setLeaving(true);
      doneTimer = window.setTimeout(onComplete, exitMs);
    }, holdMs);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const skipIntro = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onComplete, 460);
  };

  return (
    <div className={`auth-splash-screen${leaving ? ' is-leaving' : ''}`} onClick={skipIntro}>
      <span className="auth-splash-spacer" aria-hidden="true" />

      <div className="auth-splash-center">
        <h1 className="sr-only">SANBS RIDE</h1>
        <div className="auth-splash-emblem" aria-hidden="true">
          <span className="auth-splash-ring" />
          <span className="auth-splash-ring is-delayed" />
          <span className="auth-splash-core">
            <BrandMark size={92} tone="white" showSubmark hideDrop />
          </span>
          <span className="auth-splash-ripple" />
          <span className="auth-splash-ripple is-delayed" />
          <span className="auth-splash-dropfall">
            <svg viewBox="70.42 0.2 31.17 41">
              <path d={BRAND_ARTWORK.accentDotPath} fillRule="evenodd" />
            </svg>
          </span>
        </div>

        <svg className="auth-splash-ecg" viewBox="0 0 180 28" width="180" height="28" aria-hidden="true">
          <path
            d="M0 14h46l8-10 9 20 8-16 6 6h103"
            fill="none"
            stroke="rgba(255, 255, 255, .28)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="auth-splash-ecg-line"
            d="M0 14h46l8-10 9 20 8-16 6 6h103"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

      </div>

      <button
        type="button"
        className="auth-splash-hint"
        onClick={(event) => {
          event.stopPropagation();
          skipIntro();
        }}
      >
        Tap to continue
      </button>

    </div>
  );
}

export function AuthFlow({
  screen = 'splash',
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
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');

  const activeWorkspace = useMemo(() => getWorkspace(role), [role]);
  const mode = screen === 'signup' ? 'signup' : 'login';

  const switchMode = (nextMode) => {
    setLoginError('');
    setSignupError('');
    onNavigate(nextMode);
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setLoginError('');
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setLoginError('Enter your email or mobile number.');
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
      setSignupError('Enter your full name.');
      return;
    }
    if (phone.trim().length < 7) {
      setSignupError('Enter a valid mobile number.');
      return;
    }
    if (!email.trim().includes('@')) {
      setSignupError('Enter a valid email address.');
      return;
    }
    if (signupRole === 'donor' && pickupAddress.trim().length < 4) {
      setSignupError('Enter your pickup address.');
      return;
    }
    if (signupRole === 'driver' && (vehicle.trim().length < 2 || registration.trim().length < 3)) {
      setSignupError('Enter your vehicle and registration.');
      return;
    }
    if (signupPassword.trim().length < 6) {
      setSignupError('Choose a password with at least 6 characters.');
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
      driverType: 'independent',
      password: signupPassword,
    });
  };

  return (
    <div className={`auth-flow-stage${screen === 'splash' ? '' : ' is-handoff'}`}>
      <AuthStageWaves />
      {screen === 'splash' ? (
        <LogoSplashScreen onComplete={() => onNavigate('login')} />
      ) : (
      <div className="auth-minimal-shell">
      <div className="auth-minimal-stack">
        <main className="auth-minimal-card" aria-label={mode === 'login' ? 'Sign in' : 'Sign up'}>
        <div className="auth-minimal-brand">
          <button
            type="button"
            className="auth-brand-home"
            onClick={() => onNavigate('splash')}
            title="Replay opening animation"
          >
            <BrandMark size={34} tone="ink" showSubmark />
          </button>

          <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => switchMode('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => switchMode('signup')}
            >
              Sign up
            </button>
          </div>
        </div>

        {mode === 'login' ? (
          <div className="auth-minimal-body">
            <div className="auth-minimal-head">
              <h1>Sign in</h1>
              <p>Choose your workspace to continue.</p>
            </div>

            <div className="auth-role-tabs" role="radiogroup" aria-label="Workspace">
              {WORKSPACES.map(({ id, label, Icon }) => (
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
                  <Icon size={14} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <label className="field">
                <span className="field-label">Email or mobile</span>
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
                <span className="field-label">Password</span>
                <div className="auth-password-wrap">
                  <input
                    className="text-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Password"
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
                Sign in <ArrowRight size={16} />
              </button>
            </form>

            <button
              type="button"
              className="button button-secondary button-wide auth-quick-demo"
              onClick={() => onEnterDemo(role)}
            >
              <Sparkles size={14} /> Quick demo · {activeWorkspace.demoName}
            </button>
          </div>
        ) : (
          <div className="auth-minimal-body">
            <div className="auth-minimal-head">
              <h1>Create account</h1>
              <p>Sign up as a SANBS donor or driver.</p>
            </div>

            <div className="auth-role-tabs auth-role-tabs-two" role="radiogroup" aria-label="Account type">
              {[
                { id: 'donor', label: 'Donor', Icon: Heart },
                { id: 'driver', label: 'Driver', Icon: Car },
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
                  <Icon size={14} aria-hidden="true" />
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
                  placeholder={signupRole === 'driver' ? 'Kagiso Molefe' : 'Naledi Khumalo'}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>

              <div className="auth-form-row">
                <label className="field">
                  <span className="field-label">Mobile</span>
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
                  <span className="field-label">Email</span>
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
                  <span className="field-label">Pickup address</span>
                  <input
                    className="text-input"
                    type="text"
                    autoComplete="street-address"
                    placeholder="22 West Street, Sandown"
                    value={pickupAddress}
                    onChange={(event) => setPickupAddress(event.target.value)}
                  />
                </label>
              ) : (
                <div className="auth-form-row">
                  <label className="field">
                    <span className="field-label">Vehicle</span>
                    <input
                      className="text-input"
                      type="text"
                      placeholder="Toyota Corolla"
                      value={vehicle}
                      onChange={(event) => setVehicle(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Plate</span>
                    <input
                      className="text-input"
                      type="text"
                      placeholder="JHB 482 GP"
                      value={registration}
                      onChange={(event) => setRegistration(event.target.value)}
                    />
                  </label>
                </div>
              )}

              <label className="field">
                <span className="field-label">Password</span>
                <div className="auth-password-wrap">
                  <input
                    className="text-input"
                    type={showSignupPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="6+ characters"
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

              {signupError && (
                <div className="auth-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{signupError}</span>
                </div>
              )}

              <button type="submit" className="button button-primary button-wide">
                Create account <ArrowRight size={16} />
              </button>
            </form>

            <p className="auth-minimal-note">
              <ShieldCheck size={13} /> Transport coordination only · no medical data stored.
            </p>
          </div>
        )}
        </main>
      </div>
      </div>
      )}
    </div>
  );
}
