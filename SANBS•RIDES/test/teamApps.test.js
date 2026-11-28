import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROLES, packageRole } from '../scripts/package-team-app.mjs';

/* The four role team apps are deployed separately (own workflow, own host, own
   repository if required). These tests lock the contract that makes that safe:
   every pin is a real workspace role, every package is self-contained with
   relative paths, and each role has its own deploy workflow. */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appDir, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(repoRoot, relativePath));

const ROLE_ORDER = read('SANBS•RIDES/src/App.jsx').match(/const ROLE_ORDER = \[([^\]]+)\]/)[1]
  .split(',').map((entry) => entry.trim().replace(/['"]/g, '')).filter(Boolean);

const distReady = fs.existsSync(path.join(appDir, 'dist', 'index.html'));

test('every team-app pin is a real workspace role', () => {
  assert.equal(ROLES.length, 4, 'there must be exactly four deployable roles');
  for (const role of ROLES) {
    assert.ok(ROLE_ORDER.includes(role.pin), `"${role.pin}" is not in ROLE_ORDER (${ROLE_ORDER.join(', ')})`);
  }
  assert.deepEqual(ROLES.map((role) => role.pin).sort(), [...ROLE_ORDER].sort(),
    'each workspace role must have exactly one standalone app');
});

test('role slugs, folders and repository names are unique', () => {
  for (const key of ['slug', 'dir', 'repo', 'pin']) {
    const values = ROLES.map((role) => role[key]);
    assert.equal(new Set(values).size, values.length, `duplicate ${key}: ${values.join(', ')}`);
  }
  for (const role of ROLES) {
    assert.match(role.repo, /^sanbs-ride-[a-z]+-app$/, `unexpected repo name "${role.repo}"`);
  }
});

test('each role has its own deploy workflow', () => {
  for (const role of ROLES) {
    const workflowPath = `.github/workflows/deploy-${role.slug}.yml`;
    assert.ok(exists(workflowPath), `missing ${workflowPath}`);
    const workflow = read(workflowPath);
    assert.ok(workflow.includes('workflow_dispatch:'), `${workflowPath} must be manually triggerable`);
    assert.ok(workflow.includes(`--role ${role.slug}`), `${workflowPath} must package only the ${role.slug} role`);
    assert.ok(workflow.includes(`sanbs-ride-${role.slug}-app`), `${workflowPath} must publish a role-named artifact`);
    assert.ok(workflow.includes('deploy/DEPLOY_ROLES.md') || workflow.includes(role.repo),
      `${workflowPath} must stay traceable to its deployment target`);
  }
});

test('the shared sync relay ships with every package', () => {
  assert.ok(exists('deploy/sync-server.mjs'), 'deploy/sync-server.mjs is missing');
  const relay = read('deploy/sync-server.mjs');
  assert.match(relay, /GET.*\/state/s, 'relay must serve GET /state');
  assert.match(relay, /PUT.*\/state/s, 'relay must accept PUT /state');
  assert.match(relay, /Access-Control-Allow-Origin/, 'relay must allow cross-origin team apps');
  assert.match(relay, /bookings/, 'relay must validate the synced state shape');
});

test('npm exposes a packaging script per role', () => {
  const scripts = JSON.parse(read('SANBS•RIDES/package.json')).scripts;
  for (const role of ROLES) {
    assert.ok(scripts[`package:${role.slug}`], `missing npm script package:${role.slug}`);
    assert.ok(scripts[`package:${role.slug}`].includes(role.slug), `package:${role.slug} must target that role`);
  }
  assert.ok(scripts['package:all'], 'missing npm script package:all');
});

test('role packages are deployable from any path', { skip: distReady ? false : 'run npm run build first' }, () => {
  const outRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sanbs-team-apps-'));
  try {
    for (const role of ROLES) {
      const result = packageRole(role, outRoot, { zip: true, verify: true });
      assert.deepEqual(result.check.problems, [], `${role.slug} package failed verification`);

      const dir = path.join(outRoot, role.dir);
      const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
      const config = fs.readFileSync(path.join(dir, 'app-config.js'), 'utf8');
      const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.webmanifest'), 'utf8'));

      assert.ok(config.includes(`window.SANBS_TEAM_APP = '${role.pin}';`), `${role.slug} is not role-pinned`);
      assert.ok(!html.includes('SANBS_TEAM_APP'), 'the pin must live in app-config.js, not the built bundle');
      assert.equal(manifest.start_url, './', `${role.slug} manifest must be path-relative`);
      assert.ok(manifest.name.includes(role.appName), `${role.slug} must install as its own PWA`);
      assert.ok(fs.existsSync(path.join(dir, 'sync-server.mjs')), `${role.slug} is missing the sync relay`);
      assert.ok(fs.existsSync(path.join(dir, 'README.md')), `${role.slug} is missing its deploy README`);

      const zip = fs.readFileSync(result.zipPath);
      assert.equal(zip.subarray(0, 4).toString('latin1'), 'PK\u0003\u0004', `${role.slug} zip is not a valid archive`);
      assert.ok(zip.length > 100_000, `${role.slug} zip looks empty`);
    }
  } finally {
    fs.rmSync(outRoot, { recursive: true, force: true });
  }
});

test('role packages are byte-reproducible', { skip: distReady ? false : 'run npm run build first' }, () => {
  const first = fs.mkdtempSync(path.join(os.tmpdir(), 'sanbs-team-apps-a-'));
  const second = fs.mkdtempSync(path.join(os.tmpdir(), 'sanbs-team-apps-b-'));
  try {
    const role = ROLES[0];
    const a = packageRole(role, first, { zip: true });
    const b = packageRole(role, second, { zip: true });
    assert.ok(
      fs.readFileSync(a.zipPath).equals(fs.readFileSync(b.zipPath)),
      'the same source tree must produce an identical archive',
    );
  } finally {
    fs.rmSync(first, { recursive: true, force: true });
    fs.rmSync(second, { recursive: true, force: true });
  }
});
