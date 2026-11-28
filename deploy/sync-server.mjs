#!/usr/bin/env node
/* SANBS RIDE · Team-App Sync Relay — zero-dependency Node HTTP relay that keeps
 * separately deployed SANBS RIDE team apps in sync across origins.
 *   node sync-server.mjs            # 0.0.0.0:8787 (PORT overrides)
 * Apps point at it via ?sync=https://relay-host or window.SANBS_SYNC_DEFAULT.
 *   GET /state -> { rev, state, at }     PUT /state <- { state }
 */
import { createServer } from 'node:http';
const PORT = Number(process.env.PORT || 8787);
let current = { rev: 0, state: null, at: null };
const send = (res, code, body) => {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
};
createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(); return; }
  if (req.method === 'GET' && req.url.startsWith('/state')) { send(res, 200, current); return; }
  if (req.method === 'PUT' && req.url.startsWith('/state')) {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 8e6) req.destroy(); });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed && parsed.state && Array.isArray(parsed.state.bookings) && Array.isArray(parsed.state.drivers)) {
          current = { rev: current.rev + 1, state: parsed.state, at: Date.now() };
          send(res, 200, current);
        } else send(res, 422, { error: 'state must include bookings and drivers' });
      } catch { send(res, 400, { error: 'invalid JSON' }); }
    });
    return;
  }
  send(res, 404, { error: 'not found' });
}).listen(PORT, '0.0.0.0', () => console.log(`SANBS RIDE sync relay listening on 0.0.0.0:${PORT}`));
