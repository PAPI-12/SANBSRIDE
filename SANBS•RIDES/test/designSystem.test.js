import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ACCESSIBILITY_RULES,
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
} from '../src/design-system/tokens.js';
import { STATUS_META } from '../src/domain.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function readWorkspaceFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function parseCssCustomProperties(cssText) {
  const vars = new Map();
  const regex = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match = regex.exec(cssText);
  while (match) {
    vars.set(match[1], match[2].trim());
    match = regex.exec(cssText);
  }
  return vars;
}

test('CSS tokens in tokens.css stay synchronized with JS token definitions', () => {
  const cssText = readWorkspaceFile('src/design-system/tokens.css');
  const cssVars = parseCssCustomProperties(cssText);

  // Every token in COLOR_GROUPS must declare an exact matching CSS custom property in tokens.css
  for (const group of COLOR_GROUPS) {
    for (const token of group.tokens) {
      assert.ok(cssVars.has(token.cssVar), `${token.cssVar} is declared in tokens.css`);
      assert.equal(
        cssVars.get(token.cssVar).toUpperCase(),
        token.value.toUpperCase(),
        `${token.cssVar} matches JS token value ${token.value}`
      );
    }
  }

  // Spacing, radii, elevation, typography, motion, and z-index tokens exist in tokens.css
  for (const sp of SPACING) assert.equal(cssVars.get(sp.token), `${sp.px}px`, `${sp.token} spacing`);
  for (const r of RADII) assert.equal(cssVars.get(r.token), r.value, `${r.token} radius`);
  for (const el of ELEVATION) assert.ok(cssVars.has(el.token), `${el.token} elevation shadow`);
  for (const row of TYPOGRAPHY.scale) assert.equal(cssVars.get(row.token), `${row.sizePx}px`, `${row.token} size`);
  for (const dur of MOTION.durations) assert.equal(cssVars.get(dur.token), dur.value, `${dur.token} duration`);
  for (const ease of MOTION.easings) assert.equal(cssVars.get(ease.token), ease.value, `${ease.token} easing`);
  for (const z of Z_INDEX) assert.equal(cssVars.get(z.token), String(z.value), `${z.token} z-index`);

  // Shell height remains locked to 60px on desktop
  assert.equal(cssVars.get('--shell-h'), '60px');
  assert.equal(cssVars.get('--touch-target'), `${DESIGN_SYSTEM_META.minTouchTargetPx}px`);
});

test('All documented color pairings pass WCAG 2.2 AA contrast thresholds (>= 4.5:1)', () => {
  assert.ok(CONTRAST_PAIRS.length >= 12);
  for (const pair of CONTRAST_PAIRS) {
    const ratio = contrastRatio(pair.fg, pair.bg);
    assert.ok(
      ratio >= pair.minimum,
      `${pair.label} (${pair.fg} on ${pair.bg}) contrast ${ratio.toFixed(2)}:1 is below ${pair.minimum}:1`
    );
  }
});

test('Status chip specifications cover 100% of domain STATUS_META states without drift', () => {
  const domainKeys = Object.keys(STATUS_META);
  const dsKeys = STATUS_CHIP_SPECS.map((item) => item.key);
  assert.deepEqual(new Set(dsKeys), new Set(domainKeys), 'STATUS_CHIP_SPECS matches domain.js STATUS_META keys');
  for (const item of STATUS_CHIP_SPECS) {
    assert.equal(item.label, STATUS_META[item.key].label, `${item.key} label parity`);
    assert.equal(item.tone, STATUS_META[item.key].tone, `${item.key} tone parity`);
  }
});

test('Brand artwork, stealth map palette, accessibility rules, and manifest align with design system', () => {
  assert.equal(BRAND_ARTWORK.viewBox, '0 0 76.02 100');
  assert.ok(BRAND_ARTWORK.markPath.length > 100);
  assert.ok(BRAND_ARTWORK.dropPath.startsWith('M12 1'));
  assert.equal(MAP_PALETTE.stealth.background, COLORS.stealthBg);
  assert.equal(MAP_PALETTE.stealth.route, COLORS.accentRoute);
  assert.equal(MAP_PALETTE.pins.centreSelectedFill, COLORS.accent);
  assert.ok(ACCESSIBILITY_RULES.length >= 6);

  const manifest = JSON.parse(readWorkspaceFile('public/manifest.webmanifest'));
  assert.equal(manifest.background_color, COLORS.canvas);
  assert.equal(manifest.theme_color, COLORS.carbon);

  const mediaKeys = Object.keys(STUDIO_MEDIA);
  assert.ok(mediaKeys.length >= 6, 'STUDIO_MEDIA includes editorial scenes and spot illustrations');
  for (const key of mediaKeys) {
    const rel = STUDIO_MEDIA[key].replace(/^\//, '');
    assert.ok(fs.existsSync(path.join(rootDir, 'public', rel)), `${STUDIO_MEDIA[key]} exists in public/`);
  }
});
