#!/usr/bin/env node
/* SANBS RIDE · Team-App Packager — turns one production build into four
 * standalone, individually deployable role apps (donor / driver / staff / ops).
 *
 *   node scripts/package-team-app.mjs --role donor --zip --verify
 *   node scripts/package-team-app.mjs --role all   --zip --verify
 *
 * Each package is a self-contained static site: relative asset paths (so it
 * works at a domain root or any sub-path), an app-config.js that pins the role
 * (no team-switching nav — every team opens in its own window/deployment), a
 * role-branded PWA manifest, the deploy/sync-server.mjs relay and a README.
 *
 * Zips are written by this script (no external `zip` binary) with a fixed
 * timestamp, so the same source tree always produces byte-identical archives.
 */
import { deflateRawSync } from 'node:zlib';
import {
  cpSync, existsSync, mkdirSync, readFileSync, readdirSync,
  rmSync, statSync, writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(SCRIPT_DIR, '..');                 // …/SANBS•RIDES
const ROOT_DIR = resolve(APP_DIR, '..');                   // repo root
const DEPLOY_DIR = join(ROOT_DIR, 'deploy');
const DIST_DIR = join(APP_DIR, 'dist');

/* ── role table: the single source of truth for all four deployments ─────── */
export const ROLES = [
  {
    slug: 'donor', dir: 'donor', pin: 'donor',
    label: 'Donor', short: 'Donor', appName: 'Donor',
    title: 'SANBS RIDE · Donor transport',
    blurb: 'Book and track free rides to SANBS donation centres.',
    repo: 'sanbs-ride-donor-app',
  },
  {
    slug: 'driver', dir: 'driver', pin: 'driver',
    label: 'Driver', short: 'Driver', appName: 'Driver',
    title: 'SANBS RIDE · Driver trips',
    blurb: 'Accept, run and close donor pickup and drop-off trips.',
    repo: 'sanbs-ride-driver-app',
  },
  {
    slug: 'staff', dir: 'staff', pin: 'staff',
    label: 'Centre staff', short: 'Staff', appName: 'Centre Staff',
    title: 'SANBS RIDE · Centre staff',
    blurb: 'Confirm donor arrivals and keep centre donation slots filled.',
    repo: 'sanbs-ride-staff-app',
  },
  {
    slug: 'ops', dir: 'ops', pin: 'operations',
    label: 'Transport ops', short: 'Ops', appName: 'Transport Ops',
    title: 'SANBS RIDE · Transport operations',
    blurb: 'Dispatch drivers, balance capacity and watch every trip live.',
    repo: 'sanbs-ride-ops-app',
  },
];

/* ── deterministic zip writer ────────────────────────────────────────────── */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

const FIXED_STAMP = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000)
  : new Date(Date.UTC(2026, 0, 1, 0, 0, 0));

const dosStamp = (d) => ({
  time: (d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | (d.getUTCSeconds() >> 1),
  day: ((d.getUTCFullYear() - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate(),
});

function buildZip(entries) {
  const { time, day } = dosStamp(FIXED_STAMP);
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const isDir = entry.name.endsWith('/');
    const data = isDir ? Buffer.alloc(0) : entry.data;
    const crc = crc32(data);
    const deflated = isDir ? Buffer.alloc(0) : deflateRawSync(data, { level: 9 });
    const stored = isDir || deflated.length >= data.length;
    const payload = stored ? data : deflated;
    const method = stored ? 0 : 8;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);            // UTF-8 file names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, payload);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x031e, 4);           // made by UNIX
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(payload.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(((isDir ? 0o40755 : 0o100644) << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);

    offset += local.length + nameBuf.length + payload.length;
  }
  const localBuf = Buffer.concat(locals);
  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(localBuf.length, 16);
  return { zip: Buffer.concat([localBuf, centralBuf, eocd]), count: entries.length };
}

const walk = (dir, base = dir, out = []) => {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    const rel = relative(base, full).split('\\').join('/');
    if (statSync(full).isDirectory()) {
      out.push({ name: `${rel}/`, data: null });
      walk(full, base, out);
    } else {
      out.push({ name: rel, data: readFileSync(full) });
    }
  }
  return out;
};

/* ── per-role file templates ─────────────────────────────────────────────── */
const appConfig = (role) => `/* SANBS RIDE · ${role.label} standalone team app bootstrap.
 * Pinned to the "${role.pin}" workspace: there is no team-switching nav — the
 * other teams are separate deployments, each opened in its own window.
 * Deploy this folder to any static host, at a domain root or a sub-path.
 *
 * Keep every team app in sync:
 *   1. run one shared relay:  node sync-server.mjs        (port 8787 / $PORT)
 *   2. point this app at it:  open with ?sync=https://relay-host/state
 *      or set window.SANBS_SYNC_DEFAULT below.
 * Windows on the same origin also sync serverlessly via shared storage. */
window.SANBS_TEAM_APP = '${role.pin}';
window.SANBS_SYNC_DEFAULT = '';
(function () {
  var params = new URLSearchParams(window.location.search);
  var sync = params.get('sync');
  window.SANBS_SYNC_URL = sync ? sync.replace(/\\/+$/, '') : (window.SANBS_SYNC_DEFAULT || '');
})();
`;

const readme = (role) => `# SANBS RIDE · ${role.label} team app

Standalone, individually deployable SANBS RIDE app, role-pinned to **${role.pin}**.
There is no in-app team switching — each team is its own deployment, opened in
its own window.

## What is in this folder
| File | Purpose |
| --- | --- |
| \`index.html\` | Entry document, all references relative (\`./assets\`, \`./brand\`) |
| \`app-config.js\` | Pins \`window.SANBS_TEAM_APP = '${role.pin}'\` and reads \`?sync=\` |
| \`assets/\` | Production JS/CSS/font bundles from \`npm run build\` |
| \`brand/\`, \`favicon.svg\` | SANBS RIDE logo artwork and PWA icons |
| \`manifest.webmanifest\` | Role-branded PWA manifest (installs as “SANBS RIDE ${role.appName}”) |
| \`sync-server.mjs\` | Zero-dependency relay that keeps separate deployments in sync |

## Deploy
No build step is required — this folder is already production output.

- **Netlify / Vercel / Cloudflare Pages** — create one project per role from the
  same repository: build command \`npm run package:${role.slug}\` (run inside
  \`SANBS•RIDES\`), publish directory \`team-apps/${role.dir}\`.
- **GitHub Actions** — run the \`${role.title}\` workflow
  (\`.github/workflows/deploy-${role.slug}.yml\`) and download the
  \`sanbs-ride-${role.slug}-app\` artifact, or trigger it from the Actions tab.
- **Any static host (S3, nginx, IIS)** — copy the folder as-is. Relative paths
  mean it also works from a sub-directory such as \`/apps/${role.dir}/\`.
- **Local check** — \`npx serve team-apps/${role.dir}\` then open the printed URL.

## Keep every team app in sync
1. Run one shared relay anywhere all four deployments can reach it:
   \`node sync-server.mjs\` (listens on \`0.0.0.0:8787\`, override with \`PORT\`).
2. Point each app at it — open \`…/?sync=https://relay-host/state\`, or set
   \`window.SANBS_SYNC_DEFAULT = 'https://relay-host/state'\` in
   \`app-config.js\` before uploading.

Bookings, drivers, notifications and accounts mirror across all windows and all
deployments within ~1.5 s (client poll 1500 ms, debounced push 450 ms). Windows
on the same origin sync without the relay via shared storage events.

## Rebuild from source
\`\`\`bash
cd SANBS•RIDES
npm ci && npm run build
npm run package:${role.slug}        # or: package:all
\`\`\`
`;

const roleIndexHtml = (role, distHtml) => distHtml
  .replace(/(href|src)="\/(?!\/)/g, '$1="./')
  .replace(/<title>[^<]*<\/title>/, `<title>${role.title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*(")/, `$1${role.blurb}$2`)
  .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${role.title}$2`)
  .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${role.blurb}$2`)
  .replace(/([ \t]*)<script type="module"/, '$1<script src="./app-config.js"></script>\n$1<script type="module"');

const roleManifest = (role, distManifest) => {
  const base = JSON.parse(distManifest);
  return {
    ...base,
    name: `SANBS RIDE ${role.appName}`,
    short_name: `RIDE ${role.short}`,
    description: role.blurb,
    id: './',
    start_url: './',
    scope: './',
    icons: (base.icons || []).map((icon) => ({ ...icon, src: icon.src.replace(/^\//, './') })),
  };
};

/* ── verification gate ───────────────────────────────────────────────────── */
const verifyPackage = (role, outDir, zipPath) => {
  const problems = [];
  const html = readFileSync(join(outDir, 'index.html'), 'utf8');
  const config = readFileSync(join(outDir, 'app-config.js'), 'utf8');
  const manifestText = readFileSync(join(outDir, 'manifest.webmanifest'), 'utf8');
  const manifest = JSON.parse(manifestText);

  if (!config.includes(`window.SANBS_TEAM_APP = '${role.pin}';`)) {
    problems.push(`app-config.js does not pin role "${role.pin}"`);
  }
  if (!html.includes('<script src="./app-config.js"></script>')) {
    problems.push('index.html is missing the app-config.js bootstrap tag');
  }
  if (!html.includes('<script type="module"')) problems.push('index.html lost the module entry script');
  if (html.includes('src="/') || html.includes('href="/')) problems.push('index.html still has a root-absolute reference');
  if (manifestText.includes('"/')) problems.push('manifest.webmanifest still has a root-absolute reference');
  if (manifest.start_url !== './' || manifest.scope !== './') problems.push('manifest start_url/scope must be "./" for sub-path deploys');
  if (!html.includes(`<title>${role.title}</title>`)) problems.push('index.html title was not role-branded');

  const refs = [
    ...[...html.matchAll(/(?:href|src)="\.\/([^"]+)"/g)].map((m) => m[1]),
    ...manifest.icons.map((icon) => icon.src.replace(/^\.\//, '')),
  ];
  for (const ref of refs) {
    if (!existsSync(join(outDir, ref))) problems.push(`referenced file is missing: ./${ref}`);
  }
  for (const required of ['assets', 'brand', 'favicon.svg', 'sync-server.mjs', 'README.md']) {
    if (!existsSync(join(outDir, required))) problems.push(`package is missing ${required}`);
  }
  if (zipPath) {
    const zip = readFileSync(zipPath);
    if (zip.subarray(0, 4).toString('latin1') !== 'PK\u0003\u0004') problems.push('zip has no local-file-header signature');
    if (zip.subarray(zip.length - 22, zip.length - 18).toString('latin1') !== 'PK\u0005\u0006') {
      problems.push('zip has no end-of-central-directory record');
    }
  }
  return { problems, refs: refs.length };
};

/* ── packaging ───────────────────────────────────────────────────────────── */
export const packageRole = (role, outRoot, { zip = false, verify = false } = {}) => {
  const outDir = join(outRoot, role.dir);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  cpSync(join(DIST_DIR, 'assets'), join(outDir, 'assets'), { recursive: true });
  cpSync(join(DIST_DIR, 'brand'), join(outDir, 'brand'), { recursive: true });
  cpSync(join(DIST_DIR, 'favicon.svg'), join(outDir, 'favicon.svg'));
  writeFileSync(join(outDir, 'index.html'), roleIndexHtml(role, readFileSync(join(DIST_DIR, 'index.html'), 'utf8')));
  writeFileSync(join(outDir, 'manifest.webmanifest'), `${JSON.stringify(roleManifest(role, readFileSync(join(DIST_DIR, 'manifest.webmanifest'), 'utf8')), null, 2)}\n`);
  writeFileSync(join(outDir, 'app-config.js'), appConfig(role));
  writeFileSync(join(outDir, 'README.md'), readme(role));
  cpSync(join(DEPLOY_DIR, 'sync-server.mjs'), join(outDir, 'sync-server.mjs'));

  const zipPath = join(outRoot, `${role.repo}.zip`);
  let zipBytes = 0;
  if (zip) {
    rmSync(zipPath, { force: true });
    const entries = walk(outDir).map((entry) => ({
      name: `${role.dir}/${entry.name}`,
      data: entry.data,
    }));
    const built = buildZip(entries);
    writeFileSync(zipPath, built.zip);
    zipBytes = built.zip.length;
  }

  const files = walk(outDir);
  const result = {
    role, outDir, zipPath: zip ? zipPath : null, zipBytes,
    files: files.filter((f) => f.data).length,
    bytes: files.reduce((sum, f) => sum + (f.data ? f.data.length : 0), 0),
  };
  if (verify) result.check = verifyPackage(role, outDir, zip ? zipPath : null);
  return result;
};

/* ── CLI ─────────────────────────────────────────────────────────────────── */
const main = () => {
  const argv = process.argv.slice(2);
  const flag = (name) => argv.includes(`--${name}`);
  const option = (name) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : null;
  };

  const requested = (option('role') || 'all').toLowerCase();
  const outRoot = resolve(option('out') || join(ROOT_DIR, 'team-apps'));
  const zip = !flag('no-zip');
  const verify = flag('verify');

  if (!existsSync(join(DIST_DIR, 'index.html'))) {
    console.error(`✗ No production build found at ${relative(ROOT_DIR, DIST_DIR)}.`);
    console.error('  Run: cd SANBS•RIDES && npm ci && npm run build');
    process.exit(1);
  }
  if (!existsSync(join(DEPLOY_DIR, 'sync-server.mjs'))) {
    console.error('✗ deploy/sync-server.mjs is missing — the sync relay is part of every package.');
    process.exit(1);
  }

  const roles = requested === 'all'
    ? ROLES
    : ROLES.filter((r) => r.slug === requested || r.dir === requested || r.pin === requested);
  if (!roles.length) {
    console.error(`✗ Unknown role "${requested}". Use one of: ${ROLES.map((r) => r.slug).join(', ')}, all`);
    process.exit(1);
  }

  mkdirSync(outRoot, { recursive: true });
  let failed = false;
  console.log(`SANBS RIDE team-app packager → ${relative(ROOT_DIR, outRoot) || outRoot}`);
  for (const role of roles) {
    const out = packageRole(role, outRoot, { zip, verify });
    const size = (n) => `${n.toLocaleString('en-US')} B`;
    console.log(`  ✓ ${role.slug.padEnd(7)} pin=${role.pin.padEnd(11)} ${String(out.files).padStart(3)} files · ${size(out.bytes).padStart(12)}${out.zipPath ? ` · zip ${size(out.zipBytes)}` : ''}`);
    if (out.check) {
      if (out.check.problems.length) {
        failed = true;
        for (const problem of out.check.problems) console.error(`    ✗ ${role.slug}: ${problem}`);
      } else {
        console.log(`    verified: ${out.check.refs} relative references resolve, role pinned, no root-absolute paths`);
      }
    }
  }
  if (failed) {
    console.error('✗ Team-app packaging verification failed.');
    process.exit(1);
  }
  console.log(`✓ Packaged ${roles.length} role app${roles.length > 1 ? 's' : ''} — each folder deploys separately.`);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
