import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND_ARTWORK, COLORS } from '../src/design-system/tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

function readPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.ok(buf.subarray(0, 8).equals(pngSig), `${filePath} has valid PNG signature`);
  assert.equal(buf.subarray(12, 16).toString('ascii'), 'IHDR', `${filePath} contains IHDR chunk`);
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function collectFiles(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, exts, out);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

// 1. Validate BRAND_ARTWORK geometry & pointed blood drop on "i"
assert.equal(BRAND_ARTWORK.viewBox, '0 0 280 180', 'BRAND_ARTWORK viewBox must match 280x180 lockup');
assert.ok(Math.abs(BRAND_ARTWORK.aspectRatio - 280 / 180) < 0.0001, 'aspectRatio matches 280/180');
assert.ok(BRAND_ARTWORK.markPath.length > 200, 'markPath defines geometric ride + smile vector');
assert.ok(
  BRAND_ARTWORK.accentDotPath.startsWith('M 86.43') && (BRAND_ARTWORK.accentDotPath.match(/C/g) || []).length > 20,
  'accentDotPath defines the original SANBS intertwined-hearts droplet over the i'
);
assert.ok(BRAND_ARTWORK.submarkPath.length > 200, 'submarkPath defines SANBS vector glyphs');

// 2. Validate all listed brand deliverables exist and match canonical paths
for (const relUrl of BRAND_ARTWORK.files) {
  const filePath = path.join(publicDir, relUrl.replace(/^\//, ''));
  assert.ok(fs.existsSync(filePath), `Brand asset exists: ${relUrl}`);
  assert.ok(fs.statSync(filePath).size > 0, `Brand asset non-empty: ${relUrl}`);
}

const svgBrandFiles = [
  'favicon.svg',
  'brand/sanbs-ride-icon.svg',
  'brand/sanbs-ride-mark.svg',
  'brand/sanbs-ride-mark-ink.svg',
  'brand/sanbs-ride-mark-red.svg',
  'brand/sanbs-ride-mark-white.svg',
];

for (const rel of svgBrandFiles) {
  const content = fs.readFileSync(path.join(publicDir, rel), 'utf8');
  assert.ok(content.includes('<svg ') && content.includes('</svg>'), `${rel} is valid SVG wrapper`);
  assert.ok(content.includes(BRAND_ARTWORK.markPath), `${rel} embeds canonical markPath`);
  assert.ok(content.includes(BRAND_ARTWORK.accentDotPath), `${rel} embeds blood-drop accentDotPath`);
  assert.ok(content.includes(BRAND_ARTWORK.submarkPath), `${rel} embeds canonical submarkPath`);
  assert.ok(content.includes('fill-rule="evenodd"'), `${rel} declares fill-rule="evenodd"`);
}

assert.equal(
  fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8'),
  fs.readFileSync(path.join(publicDir, 'brand/sanbs-ride-icon.svg'), 'utf8'),
  'favicon.svg stays synced with brand/sanbs-ride-icon.svg'
);

assert.ok(
  fs.readFileSync(path.join(publicDir, 'brand/sanbs-ride-mark.svg'), 'utf8').includes(COLORS.accent),
  'Primary mark uses SANBS Crimson blood drop'
);
assert.ok(
  fs.readFileSync(path.join(publicDir, 'brand/sanbs-ride-icon.svg'), 'utf8').includes(COLORS.accent),
  'App icon squircle uses solid SANBS Crimson #D42127 with pure white lockup'
);

// 3. Validate raster PNG icons (Apple touch icon 180x180 & master 1200x1200)
const touchIconDims = readPngDimensions(path.join(publicDir, 'brand/apple-touch-icon.png'));
assert.deepEqual(touchIconDims, { width: 180, height: 180 }, 'apple-touch-icon.png is 180x180');

const masterDims = readPngDimensions(path.join(publicDir, 'brand/sanbs-ride-logo-redesign.png'));
assert.deepEqual(masterDims, { width: 1200, height: 1200 }, 'sanbs-ride-logo-redesign.png is 1200x1200');

// 4. Validate first-screen (splash + auth) & header integration + zero legacy logo residue
const authFlowSrc = fs.readFileSync(path.join(rootDir, 'src/components/AuthFlow.jsx'), 'utf8');
assert.ok(authFlowSrc.includes('<BrandMark size={92} tone="white" showSubmark'), 'Splash screen showcases all-white BrandMark on SANBS Red');
assert.ok(authFlowSrc.includes('AuthStageWaves') && authFlowSrc.includes('auth-splash-dropfall'), 'Auth stage renders shared heartbeat waves and the falling SANBS droplet');
assert.ok(!authFlowSrc.includes('<h1>RIDE</h1>'), 'Splash screen avoids duplicate RIDE heading beneath new logo');

const sharedSrc = fs.readFileSync(path.join(rootDir, 'src/components/Shared.jsx'), 'utf8');
assert.ok(!sharedSrc.includes('brand-word">RIDE<'), 'SanbsBrand avoids duplicate RIDE wordmark beside new lockup');

const designCssSrc = fs.readFileSync(path.join(rootDir, 'src/design.css'), 'utf8');
const splashBlock = designCssSrc.slice(designCssSrc.indexOf('.auth-splash-screen {'), designCssSrc.indexOf('.auth-splash-hint:hover'));
const minimalShellBlock = designCssSrc.slice(designCssSrc.indexOf('.auth-minimal-shell {'), designCssSrc.indexOf('.auth-minimal-stack {'));
assert.ok(!splashBlock.includes('gradient('), 'Splash screen uses solid color background with zero gradients');
assert.ok(!minimalShellBlock.includes('gradient('), 'Auth shell uses solid color background with zero gradients');
assert.ok(/\.app-root\.is-auth-flow \{[\s\S]{0,220}?background: var\(--accent\);/.test(designCssSrc), 'Shared auth stage uses solid SANBS Red background');
assert.ok(designCssSrc.includes('.auth-flow-stage {') && designCssSrc.includes('.auth-stage-waves {'), 'One continuous red sea stage carries both auth screens seamlessly');

for (const file of [
  ...collectFiles(path.join(rootDir, 'src'), ['.js', '.jsx', '.css']),
  ...collectFiles(publicDir, ['.svg']),
]) {
  const txt = fs.readFileSync(file, 'utf8');
  assert.ok(!txt.includes('76.02 100'), `Legacy viewBox 76.02 100 removed from ${path.relative(rootDir, file)}`);
}

console.log('Brand & Logo CI verified OK: 6 SVGs, 2 PNGs, tokens.js, AuthFlow splash, Shared header.');
