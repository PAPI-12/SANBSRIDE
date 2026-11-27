import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App.jsx';
import './design.css';
import './mobile.css';
import './console.css';
import './desktop.css';
import './polish.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-600.css';

function incidentId() {
  return globalThis.crypto?.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10);
}

function errorMessage(error) {
  const message = typeof error === 'string' ? error : error?.message || String(error || 'Unknown error');
  return message.replace(/https?:\/\/[^\s)]+/g, '[external URL]').slice(0, 400);
}

function logIncident(source, error, details = {}) {
  const incident = {
    id: details.id || incidentId(),
    source,
    name: error?.name || 'Error',
    message: errorMessage(error),
    stack: error?.stack || '',
    componentStack: details.componentStack || '',
  };
  // Keep diagnostics local to the browser console; never send donor data to a third party.
  console.error('[SANBS RIDE app error]', incident);
  window.dispatchEvent(new CustomEvent('sanbs-ride-app-error', { detail: incident }));
  return incident;
}

class AppErrorBoundary extends React.Component {
  state = { error: null, errorId: null, retryKey: 0 };

  static getDerivedStateFromError(error) {
    return { error, errorId: incidentId() };
  }

  componentDidCatch(error, info) {
    logIncident('react-render', error, {
      id: this.state.errorId,
      componentStack: info.componentStack,
    });
  }

  retry = () => this.setState((state) => ({
    error: null,
    errorId: null,
    retryKey: state.retryKey + 1,
  }));

  render() {
    if (this.state.error) {
      return <main style={styles.fatal} role="alert">
        <div style={styles.card}>
          <div style={styles.mark} aria-hidden="true">!</div>
          <p style={styles.kicker}>SANBS RIDE · RECOVERY</p>
          <h1 style={styles.title}>The app hit an error</h1>
          <p style={styles.body}>Your saved bookings have not been cleared. Try reopening the app. If the problem returns, share the incident code and the matching browser-console entry with support.</p>
          <p style={styles.incident}>Incident: <code>{this.state.errorId}</code></p>
          <details style={styles.details}>
            <summary>What failed</summary>
            <pre style={styles.errorText}>{errorMessage(this.state.error)}</pre>
          </details>
          <div style={styles.actions}>
            <button style={styles.primaryButton} type="button" onClick={this.retry}>Try again</button>
            <button style={styles.secondaryButton} type="button" onClick={() => window.location.reload()}>Reload app</button>
          </div>
        </div>
      </main>;
    }
    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}

function RuntimeErrorMonitor() {
  const [incident, setIncident] = useState(null);

  useEffect(() => {
    const onError = (event) => {
      if (event.error || event.message) logIncident('window-error', event.error || event.message);
    };
    const onRejection = (event) => logIncident('unhandled-rejection', event.reason);
    const onAppError = (event) => setIncident(event.detail);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('sanbs-ride-app-error', onAppError);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('sanbs-ride-app-error', onAppError);
    };
  }, []);

  if (!incident) return null;
  return <aside style={styles.notice} role="alert" aria-live="assertive">
    <div>
      <strong>App error captured · {incident.id}</strong>
      <p>{incident.source}: {incident.message}</p>
      <small>Open the browser console and copy the entry beginning “[SANBS RIDE app error]”.</small>
    </div>
    <button type="button" style={styles.dismiss} onClick={() => setIncident(null)} aria-label="Dismiss error notice">×</button>
  </aside>;
}

function AppRoot() {
  useEffect(() => {
    document.documentElement.dataset.sanbsAppReady = 'true';
  }, []);

  return <>
    <AppErrorBoundary><App /></AppErrorBoundary>
    <RuntimeErrorMonitor />
  </>;
}

const styles = {
  fatal: { minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: '#F3F4F6', color: '#0A0B0D', fontFamily: 'Inter, system-ui, sans-serif' },
  card: { width: 'min(100%, 520px)', padding: 28, border: '1px solid #E5E7EB', borderRadius: 24, background: '#FFFFFF', boxShadow: '0 20px 50px rgba(10,11,13,.1)' },
  mark: { width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#0A0B0D', color: '#FF4D53', fontWeight: 800, fontSize: 22 },
  kicker: { margin: '18px 0 7px', color: '#D42127', fontSize: 11, fontWeight: 700, letterSpacing: '.12em' },
  title: { margin: '0 0 12px', fontSize: 26, lineHeight: 1.15 },
  body: { margin: 0, color: '#5A606D', lineHeight: 1.55 },
  incident: { margin: '16px 0 0', fontSize: 13 },
  details: { marginTop: 14, color: '#5A606D', fontSize: 13 },
  errorText: { maxHeight: 160, overflow: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 12, borderRadius: 12, background: '#F3F4F6', color: '#1F242D' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  primaryButton: { minHeight: 44, padding: '0 20px', border: 0, borderRadius: 999, background: '#D42127', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' },
  secondaryButton: { minHeight: 44, padding: '0 20px', border: '1px solid #E5E7EB', borderRadius: 999, background: '#F3F4F6', color: '#0A0B0D', fontWeight: 600, cursor: 'pointer' },
  notice: { position: 'fixed', zIndex: 100000, right: 14, bottom: 14, width: 'min(440px, calc(100vw - 28px))', display: 'flex', gap: 12, justifyContent: 'space-between', padding: '14px 16px', border: '1px solid #2A2E36', borderRadius: 16, background: '#0A0B0D', color: '#FFFFFF', boxShadow: '0 12px 32px rgba(0,0,0,.28)', font: '13px/1.45 Inter, system-ui, sans-serif' },
  dismiss: { alignSelf: 'flex-start', padding: '0 4px', border: 0, background: 'transparent', color: '#9CA3AF', fontSize: 22, lineHeight: 1, cursor: 'pointer' },
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('SANBS RIDE could not find its root app container.');
}

createRoot(container).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>,
);
