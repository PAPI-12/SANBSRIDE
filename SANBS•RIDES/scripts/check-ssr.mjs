import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { BRAND_ARTWORK } from '../src/design-system/tokens.js';

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

try {
  const { AuthFlow } = await vite.ssrLoadModule('/src/components/AuthFlow.jsx');
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');

  const strip = (s) => s.replace(/<!-- -->/g, '');
  const authProps = {
    screen: 'splash',
    defaultRole: 'donor',
    registeredAccounts: [],
    onNavigate: () => {},
    onEnterDemo: () => {},
    onLogin: () => {},
    onSignup: () => {},
    onToast: () => {},
  };
  const splashHtml = strip(renderToString(React.createElement(AuthFlow, authProps)));
  const loginHtml = strip(renderToString(React.createElement(AuthFlow, { ...authProps, screen: 'login' })));
  const appHtml = strip(renderToString(React.createElement(App)));

  for (const [name, html] of [
    ['Splash', splashHtml],
    ['Login', loginHtml],
    ['App', appHtml],
  ]) {
    assert.ok(html.includes(BRAND_ARTWORK.viewBox), `${name} renders redesigned logo viewBox`);
    assert.ok(html.includes(BRAND_ARTWORK.accentDotPath), `${name} renders blood-drop path on i`);
    assert.ok(html.includes(BRAND_ARTWORK.submarkPath), `${name} renders SANBS submark path`);
  }

  assert.ok(!splashHtml.includes('<h1>RIDE</h1>'), 'Splash screen has no duplicate RIDE title');

  console.log(
    `SSR CI verified OK — Splash=${splashHtml.length} Login=${loginHtml.length} App=${appHtml.length}`
  );
} finally {
  await vite.close();
}
