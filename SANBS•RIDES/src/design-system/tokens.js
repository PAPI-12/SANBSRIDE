/**
 * SANBS RIDE — Canonical Design System Tokens (JS Single Source of Truth)
 *
 * Visual language: Monochrome + SANBS Crimson Red + Stealth Dark Maps
 * Shared across React primitives, SVG artwork, Leaflet maps, charts, and CSS tokens.
 */

export const DESIGN_SYSTEM_META = {
  name: 'SANBS RIDE Design System',
  version: '2.0.0',
  codename: 'Carbon & Crimson',
  theme: 'Monochrome + SANBS Crimson Red',
  targetViewportMobile: { width: 390, height: 844 },
  minViewportWidth: 320,
  minTouchTargetPx: 44,
};

export const STUDIO_MEDIA = {
  heroMobility: '/design-system/hero-mobility.png',
  donorSanctuary: '/design-system/donor-centre-editorial.png',
  stealthGrid: '/design-system/stealth-city-grid.png',
};

export const BRAND_ARTWORK = {
  viewBox: '0 0 76.02 100',
  aspectRatio: 76.02 / 100,
  markPath:
    'M 39.06 0.49 C 39.57 1.34 39.57 1.34 39.77 2.22 C 40.11 3.31 40.6 3.99 41.27 4.9 C 41.5 5.53 41.72 6.14 41.94 6.77 C 42.28 7.28 42.62 7.78 42.96 8.29 C 43.3 8.97 43.64 9.65 43.98 10.33 C 44.1 10.46 44.1 10.46 44.66 11.18 C 45.66 12.77 46.49 14.35 47.2 16.1 C 47.69 16.82 47.69 16.82 48.22 17.45 C 48.39 17.67 48.54 17.89 48.71 18.11 C 49.47 19.11 50.24 20.1 51 21.08 C 52.75 23.34 52.75 23.34 53.44 24.56 C 54.04 25.49 54.75 26.27 55.51 27.09 C 55.95 27.54 56.36 28.04 56.75 28.53 C 57.62 29.58 58.53 30.56 59.48 31.55 C 59.89 32 60.31 32.45 60.7 32.92 C 61.16 33.43 61.64 33.92 62.13 34.41 C 62.25 34.63 62.35 34.85 62.47 35.09 C 62.69 35.21 62.91 35.31 63.14 35.43 C 63.53 35.94 63.94 36.45 64.33 36.96 C 64.7 37.36 65.08 37.75 65.45 38.16 C 66.21 38.96 66.89 39.79 67.55 40.69 C 67.94 41.15 68.35 41.59 68.74 42.05 C 69.84 43.3 70.35 44.57 70.95 46.12 C 71.17 46.39 71.39 46.68 71.62 46.96 C 71.96 47.69 72.3 48.44 72.64 49.17 C 72.8 49.41 72.93 49.66 73.08 49.92 C 73.64 50.98 73.88 52.07 74.17 53.24 C 74.3 53.66 74.46 54.07 74.61 54.51 C 75.12 56.28 75.34 58.02 75.53 59.85 C 75.56 60.14 75.59 60.45 75.63 60.75 C 75.97 65.21 76.02 69.95 74.17 74.1 C 73.95 75 73.71 75.92 73.49 76.81 C 72.98 77.49 72.98 77.49 72.13 77.49 C 71.79 76.32 71.74 75.41 71.73 74.2 C 71.73 73.83 71.73 73.46 71.71 73.08 C 71.79 72.07 71.79 72.07 72.47 70.71 C 73.47 66.69 72.61 61.02 70.88 57.29 C 70.44 56.29 70.44 56.29 70.06 55.04 C 69.39 52.8 68.45 50.58 66.88 48.83 C 66.59 48.39 66.3 47.93 66.03 47.47 C 65.52 46.69 65.01 45.95 64.43 45.22 C 63.82 44.42 63.82 44.42 63.16 43.42 C 62.48 42.4 61.74 41.47 60.94 40.52 C 60.69 40.21 60.43 39.89 60.18 39.57 C 59.43 38.69 58.67 37.82 57.89 36.96 C 57.7 36.75 57.53 36.53 57.34 36.31 C 56.67 35.57 55.97 34.89 55.26 34.19 C 54.21 33.14 53.38 32.14 52.63 30.85 C 52.36 30.56 52.07 30.29 51.78 30 C 50.88 29.02 50.03 28.02 49.24 26.95 C 48.97 26.66 48.68 26.39 48.39 26.1 C 47.71 25.25 47.71 25.25 47.71 24.92 C 47.49 24.8 47.27 24.69 47.03 24.58 C 46.57 23.73 46.12 22.88 45.68 22.03 C 44.62 20.32 43.32 18.78 42.05 17.22 C 41.5 16.52 41.04 15.82 40.59 15.08 C 40.37 14.79 40.15 14.52 39.91 14.23 C 39.77 13.98 39.62 13.7 39.48 13.43 C 38.92 12.47 38.65 12.36 37.53 12.36 C 36.86 13.04 36.86 13.04 36.45 13.87 C 36.01 14.74 36.01 14.74 35.16 15.76 C 34.99 16.04 34.8 16.32 34.63 16.62 C 33.97 17.62 33.97 17.62 33.06 18.69 C 32.12 19.81 31.34 20.96 30.58 22.2 C 30.43 22.46 30.26 22.71 30.09 22.96 C 29.78 23.49 29.49 24.03 29.22 24.58 C 28.83 25.03 28.44 25.49 28.04 25.93 C 27.85 26.14 27.68 26.36 27.49 26.58 C 27.12 27 26.73 27.41 26.34 27.8 C 25.93 28.31 25.54 28.82 25.15 29.32 C 24.69 29.88 24.25 30.46 23.8 31.02 C 23.12 31.87 23.12 31.87 22.63 32.63 C 22.1 33.4 22.1 33.4 21.08 34.24 C 20.74 34.63 20.4 35.02 20.06 35.43 C 19.84 35.65 19.62 35.87 19.39 36.11 C 18.55 37.04 17.77 38.01 17.01 38.99 C 16.49 39.62 15.96 40.26 15.42 40.89 C 14.69 41.81 14.06 42.74 13.45 43.74 C 13.28 43.96 13.11 44.18 12.94 44.42 C 12.72 44.86 12.5 45.32 12.26 45.78 C 11.92 46.23 11.58 46.68 11.24 47.13 C 10.96 47.64 10.69 48.15 10.4 48.66 C 10.11 49.05 9.84 49.44 9.55 49.85 C 9.26 50.64 8.97 51.42 8.7 52.22 C 8.57 52.48 8.43 52.75 8.29 53 C 7.8 54.04 7.51 55.05 7.21 56.16 C 7.12 56.53 7.02 56.92 6.92 57.31 C 5.56 62.89 6.11 69.57 8.53 74.78 C 8.6 74.95 8.6 74.95 8.96 75.81 C 9.45 76.98 9.94 78.02 10.74 79.02 C 11.08 79.53 11.41 80.04 11.75 80.55 C 13.47 83.02 15.03 85.26 17.52 86.99 C 17.81 87.21 18.08 87.43 18.37 87.67 C 18.88 88.01 19.39 88.35 19.89 88.69 C 20.28 88.96 20.68 89.25 21.08 89.54 C 21.52 89.76 21.98 89.98 22.44 90.21 C 22.73 90.43 23 90.65 23.29 90.89 C 24.19 91.23 25.1 91.57 26 91.91 C 26.44 92.13 26.9 92.35 27.36 92.59 C 30.5 93.45 33.6 93.98 36.86 94.11 C 37.21 94.13 37.58 94.15 37.96 94.17 C 41.66 94 45.45 93.49 48.9 92.08 C 50.56 91.42 50.56 91.42 51.37 91.16 C 52.22 90.86 52.76 90.43 53.48 89.87 C 54.04 89.54 54.61 89.2 55.17 88.86 C 55.44 88.64 55.73 88.42 56.02 88.18 C 56.65 87.77 57.26 87.38 57.89 86.99 C 58.8 86.41 59.5 85.89 60.26 85.13 C 60.6 84.85 60.94 84.57 61.28 84.28 C 61.69 83.67 62.08 83.04 62.47 82.41 C 62.81 81.9 63.14 81.39 63.48 80.89 C 63.7 80.55 63.92 80.21 64.16 79.87 C 64.43 79.53 64.72 79.19 65.01 78.85 C 68.59 72.88 68.49 65.74 65.76 59.48 C 64.74 57.67 63.57 56.28 61.96 54.94 C 61.74 54.66 61.52 54.38 61.28 54.09 C 60.94 53.87 60.6 53.65 60.26 53.41 C 59.99 53.19 59.7 52.97 59.41 52.73 C 58.63 52.37 57.84 52.04 57.04 51.71 C 56.8 51.59 56.56 51.48 56.33 51.34 C 52.54 49.92 48.24 50.25 44.83 52.39 C 44.59 52.53 44.35 52.66 44.11 52.82 C 43.11 53.48 42.28 54.26 41.43 55.11 C 41.33 55.19 41.33 55.19 40.77 55.63 C 37.11 59.07 37.52 64.15 38.03 68.74 C 38.77 71.49 40.62 73.22 42.62 75.12 C 42.84 75.34 43.06 75.56 43.3 75.8 C 43.42 75.88 43.42 75.88 44.01 76.29 C 44.66 76.81 44.66 76.81 44.83 77.66 C 44.49 78.85 44.23 79.16 43.47 80.04 C 43.18 80.6 42.89 81.16 42.62 81.73 C 42.28 82.29 41.94 82.87 41.6 83.43 C 41.47 83.72 41.32 84.01 41.16 84.29 C 40.76 85.13 40.76 85.13 40.32 85.82 C 39.91 86.48 39.91 86.48 39.55 87.31 C 39.23 88.01 39.23 88.01 38.72 88.35 C 37.26 88.35 36.99 87.99 36.23 86.79 C 35.57 85.84 34.8 85.09 33.97 84.28 C 33.8 84.07 33.62 83.87 33.45 83.65 C 32.63 82.72 31.68 81.97 30.72 81.21 C 29.9 80.55 29.9 80.55 29.05 79.7 C 28.54 79.46 28.04 79.24 27.53 79.02 C 27.02 78.68 26.51 78.34 26 78 C 25.78 77.87 25.56 77.73 25.32 77.59 C 24.19 76.87 23.22 76.07 22.27 75.12 C 22.05 74.95 21.83 74.78 21.59 74.61 C 20.91 74.1 20.91 74.1 20.06 73.25 C 18.2 71.52 18.2 71.52 17.28 70.78 C 16.6 70.13 16.15 69.47 15.65 68.67 C 15.45 68.44 15.25 68.2 15.04 67.94 C 12.84 64.28 12.92 59.02 14.54 55.14 C 15.33 53.85 16.16 52.68 17.18 51.54 C 17.47 51.2 17.74 50.86 18.03 50.53 C 19.27 49.41 20.39 48.74 21.93 48.15 C 22.27 47.93 22.61 47.71 22.95 47.47 C 23.59 47.27 24.24 47.1 24.88 46.93 C 25.22 46.85 25.56 46.76 25.92 46.68 C 30.04 45.73 34.82 46.62 37.87 49.68 C 38.09 49.95 38.31 50.24 38.55 50.53 C 40.32 50.53 40.32 50.53 41.27 49.34 C 41.94 49.02 41.94 49.02 42.76 48.73 C 43.78 48.35 44.69 47.96 45.68 47.47 C 46.3 47.3 46.93 47.15 47.57 47.01 C 47.73 46.98 47.73 46.98 48.56 46.81 C 52.83 45.91 57.43 46.56 61.28 48.66 C 61.72 48.88 62.18 49.1 62.64 49.34 C 63.09 49.78 63.55 50.24 63.99 50.7 C 64.2 50.88 64.42 51.05 64.64 51.24 C 65.18 51.71 65.18 51.71 65.86 52.56 C 66.13 52.83 66.42 53.12 66.71 53.41 C 67.55 54.66 68.25 55.95 68.91 57.31 C 69.05 57.56 69.18 57.84 69.32 58.11 C 69.89 59.51 70.18 60.92 70.47 62.42 C 70.52 62.7 70.59 62.99 70.64 63.28 C 71.35 66.81 71.85 70.18 70.84 73.73 C 70.49 75.32 70.51 76.88 70.78 78.51 C 70.32 79.14 69.88 79.75 69.42 80.38 C 69.05 81.16 68.71 81.94 68.39 82.75 C 68.06 83.43 68.06 83.43 67.38 84.28 C 67.27 84.51 67.13 84.75 67.01 84.99 C 66.28 86.23 65.33 87.18 64.33 88.18 C 64.13 88.43 63.92 88.69 63.72 88.96 C 61.65 91.52 59.43 93.69 56.36 94.96 C 55.17 95.47 55.17 95.47 54.48 95.96 C 53.49 96.59 52.53 96.95 51.44 97.34 C 51.15 97.46 50.86 97.57 50.58 97.69 C 49.69 97.98 48.85 98.17 47.95 98.35 C 45.32 98.88 45.32 98.88 44.32 99.88 C 42.66 99.98 40.98 99.98 39.3 99.98 C 38.47 99.98 37.62 99.98 36.79 100 C 36.26 100 35.72 100 35.19 100 C 34.7 100 34.23 100 33.72 100 C 32.41 99.88 31.82 99.61 30.75 98.86 C 29.97 98.64 29.19 98.46 28.41 98.29 C 25.47 97.63 22.93 96.79 20.4 95.13 C 20.08 95.03 19.76 94.91 19.42 94.81 C 17.59 94.2 16.03 93.23 14.64 91.91 C 14.47 91.76 14.47 91.76 13.64 90.99 C 12.42 89.87 11.21 88.72 10.02 87.55 C 9.82 87.36 9.62 87.16 9.41 86.97 C 7.39 84.99 6.21 82.82 5.14 80.21 C 5.05 80.09 5.05 80.09 4.66 79.51 C 3.19 77.27 2.34 74.8 1.58 72.24 C 1.49 72 1.41 71.78 1.32 71.54 C 0.98 70.44 0.85 69.34 0.71 68.2 C 0.64 67.76 0.59 67.33 0.54 66.88 C 0.03 62.53 0 58.11 1.41 53.92 C 1.49 53.68 1.58 53.43 1.65 53.19 C 2.36 51.14 3.24 49.36 4.46 47.57 C 4.99 46.78 5.39 45.96 5.82 45.1 C 6.72 43.37 7.9 41.96 9.21 40.52 C 9.85 39.79 10.46 39.06 11.08 38.31 C 11.69 37.57 12.3 36.84 12.94 36.11 C 13.2 35.8 13.43 35.5 13.69 35.18 C 14.37 34.36 15.08 33.63 15.82 32.89 C 16.66 31.95 17.44 30.99 18.2 30 C 19.08 28.92 19.98 27.83 20.91 26.78 C 21.85 25.7 22.61 24.64 23.29 23.39 C 23.63 22.93 23.97 22.47 24.3 22.03 C 24.47 21.79 24.66 21.56 24.83 21.32 C 25.22 20.81 25.61 20.32 26 19.83 C 26.17 19.61 26.34 19.39 26.51 19.15 C 26.9 18.64 27.29 18.13 27.7 17.62 C 28.71 16.25 29.43 14.96 30.07 13.38 C 30.77 12.16 31.55 11.01 32.33 9.84 C 32.84 9.07 33.23 8.28 33.63 7.45 C 33.85 7.06 34.07 6.67 34.31 6.26 C 34.48 5.92 34.63 5.6 34.8 5.26 C 35.33 4.22 35.33 4.22 35.77 3.54 C 36.18 2.87 36.18 2.87 36.53 1.8 C 37.04 0.31 37.6 0 39.06 0.49Z M 20.4 54.26 C 20.23 54.48 20.08 54.72 19.91 54.95 C 17.69 58.53 17.25 62.11 19.27 65.89 C 19.79 66.74 20.35 67.47 21.08 68.16 C 22.24 69.47 22.24 69.47 22.74 70.13 C 23.46 70.88 24.25 71.25 25.15 71.73 C 25.56 72.05 25.95 72.39 26.34 72.74 C 26.51 72.86 26.51 72.86 27.36 73.42 C 27.76 73.76 28.15 74.1 28.54 74.44 C 28.71 74.58 28.71 74.58 29.56 75.29 C 29.78 75.56 30 75.85 30.24 76.14 C 30.41 76.27 30.41 76.27 31.26 76.98 C 31.55 77.26 31.82 77.54 32.11 77.83 C 32.8 78.46 33.5 79.04 34.23 79.6 C 35.41 80.55 36.31 81.51 37.19 82.75 C 37.53 82.92 37.53 82.92 38.55 82.92 C 39.4 81.9 39.4 81.9 39.81 81.16 C 40.25 80.38 40.25 80.38 40.89 79.7 C 41.43 79.02 41.43 79.02 41.43 77.49 C 40.86 76.87 40.26 76.49 39.54 76.05 C 37.87 74.83 36.64 73.1 35.5 71.39 C 35.36 71.18 35.21 70.98 35.06 70.76 C 32.48 66.2 32.9 61.43 34.99 56.8 C 35.69 55.82 35.69 55.82 36.35 55.11 C 37.55 53.71 37.55 53.71 37.36 52.39 C 36.43 51.27 35.43 50.68 34.14 50.02 C 33.8 49.8 33.46 49.58 33.12 49.34 C 27.88 48.34 23.3 49.58 20.4 54.26Z',
  dropPath: 'M12 1C12 1 2.5 12.5 2.5 19a9.5 9.5 0 0 0 19 0C21.5 12.5 12 1 12 1Z',
  ecgPath: 'M0 14h46l8-10 9 20 8-16 6 6h103',
  files: [
    '/brand/sanbs-ride-mark.svg',
    '/brand/sanbs-ride-mark-red.svg',
    '/brand/sanbs-ride-mark-ink.svg',
    '/brand/sanbs-ride-mark-white.svg',
    '/brand/sanbs-ride-icon.svg',
    '/brand/apple-touch-icon.png',
  ],
};

export const COLORS = {
  // Ink & Carbon
  ink: '#0A0B0D',
  ink2: '#181A20',
  ink3: '#2E323B',
  carbon: '#0A0B0D',
  carbon2: '#14161B',
  carbon3: '#1F2229',
  carbonLine: '#262A33',
  muted: '#5A606D',
  muted2: '#646B78',
  mutedOnDark: '#9CA3AF',
  mutedOnDark2: '#B6BDC9',

  // Neutral Surfaces & Hairlines
  canvas: '#ECEEF2',
  canvas2: '#E2E5EB',
  paper: '#FFFFFF',
  paper2: '#F3F4F6',
  paper3: '#EBEDF0',
  paper4: '#F6F7F8',
  line: '#E6E8EC',
  line2: '#D4D7DF',
  white: '#FFFFFF',

  // Single Bold Brand Accent — SANBS Crimson Red
  accent: '#D42127',
  accentDark: '#B0171D',
  accentDeep: '#7C0F13',
  accentBright: '#FF4D53',
  accentRoute: '#FF3B42',
  accentSoft: '#FDECEE',
  accentGhost: '#FFF5F5',
  accentBorder: '#F0C4C6',
  accentInk: '#FFFFFF',

  // Semantic Statuses
  ok: '#0F7B4F',
  okBright: '#34D399',
  okSoft: '#E6F4EC',
  warn: '#8A5A00',
  warnBright: '#F59E0B',
  warnSoft: '#FDF3DC',
  info: '#1B5A8F',
  infoSoft: '#E8F1F9',
  violet: '#543680',
  violetSoft: '#EFEAF8',
  danger: '#A81C13',

  // Stealth Map Surfaces
  stealthBg: '#0F1115',
  stealthBlock: '#161920',
  stealthBlockStroke: '#1D212B',
  stealthRoad: '#1E222C',
  stealthRoadEdge: '#282D38',
  stealthRouteBase: '#2D323E',
  stealthPark: '#141A18',
};

export const COLOR_GROUPS = [
  {
    id: 'monochrome',
    title: 'Monochrome & Carbon',
    description: 'High-contrast ink and architectural carbon surfaces for headers, sidebars, telemetry pills, and dark overlays.',
    tokens: [
      { name: 'Carbon / Ink', cssVar: '--carbon', value: COLORS.carbon, textOn: '#FFFFFF', role: 'Primary dark cards, global header, sidebars, phone bezel' },
      { name: 'Carbon 2', cssVar: '--carbon-2', value: COLORS.carbon2, textOn: '#FFFFFF', role: 'Nested cards and triggers on carbon backgrounds' },
      { name: 'Carbon 3', cssVar: '--carbon-3', value: COLORS.carbon3, textOn: '#FFFFFF', role: 'Hover and active states inside dark surfaces' },
      { name: 'Carbon Line', cssVar: '--carbon-line', value: COLORS.carbonLine, textOn: '#FFFFFF', role: '1px dividers and subtle card borders on dark surfaces' },
      { name: 'Ink 2', cssVar: '--ink-2', value: COLORS.ink2, textOn: '#FFFFFF', role: 'Strong secondary headings and high-contrast copy' },
      { name: 'Muted', cssVar: '--muted', value: COLORS.muted, textOn: '#FFFFFF', role: 'Secondary descriptions, metadata, form labels' },
      { name: 'Muted 2', cssVar: '--muted-2', value: COLORS.muted2, textOn: '#FFFFFF', role: 'Supporting timestamps and captions (AA-safe on #F3F4F6)' },
      { name: 'Muted on Dark', cssVar: '--muted-on-dark', value: COLORS.mutedOnDark, textOn: '#0A0B0D', role: 'Secondary labels on carbon surfaces (7.9:1 on #0A0B0D)' },
    ],
  },
  {
    id: 'surfaces',
    title: 'Neutral Surfaces & Hairlines',
    description: 'Crisp stark white reading surfaces paired with cool neutral gray stages and understated borders.',
    tokens: [
      { name: 'Paper (Pure White)', cssVar: '--paper', value: COLORS.paper, textOn: '#0A0B0D', role: 'Primary cards, mobile app viewport, modal & drawer bodies' },
      { name: 'Paper 2 (Cool Gray)', cssVar: '--paper-2', value: COLORS.paper2, textOn: '#0A0B0D', role: 'Input fields, secondary tiles, soft drawer headers' },
      { name: 'Paper 4 (Soft Tint)', cssVar: '--paper-4', value: COLORS.paper4, textOn: '#0A0B0D', role: 'Receipt cards, list items, quiet shortcut rows' },
      { name: 'Canvas Stage', cssVar: '--canvas', value: COLORS.canvas, textOn: '#0A0B0D', role: 'App stage backdrop behind consoles and phone frames' },
      { name: 'Line Hairline', cssVar: '--line', value: COLORS.line, textOn: '#0A0B0D', role: 'Table rows, card outlines, modal & drawer dividers' },
      { name: 'Line Strong', cssVar: '--line-2', value: COLORS.line2, textOn: '#0A0B0D', role: 'Secondary button borders and inactive radio/check rings' },
    ],
  },
  {
    id: 'accent',
    title: 'SANBS Crimson Red Accent',
    description: 'Used as the single bold brand accent for primary CTAs, active route strokes, brand mark, and critical journey markers.',
    tokens: [
      { name: 'SANBS Crimson', cssVar: '--accent', value: COLORS.accent, textOn: '#FFFFFF', role: 'Primary buttons, active dock disc, brand mark, focus rings' },
      { name: 'Crimson Dark', cssVar: '--accent-dark', value: COLORS.accentDark, textOn: '#FFFFFF', role: 'Hover/pressed states and high-contrast red labels on light' },
      { name: 'Crimson Deep', cssVar: '--accent-deep', value: COLORS.accentDeep, textOn: '#FFFFFF', role: 'Validation error copy on tinted red backgrounds' },
      { name: 'Crimson Bright', cssVar: '--accent-bright', value: COLORS.accentBright, textOn: '#0A0B0D', role: 'Key metrics, ECG trace & interactive highlights on #0A0B0D' },
      { name: 'Route Crimson', cssVar: '--accent-route', value: COLORS.accentRoute, textOn: '#FFFFFF', role: 'Active travelled route line & halo on stealth dark maps' },
      { name: 'Crimson Soft', cssVar: '--accent-soft', value: COLORS.accentSoft, textOn: '#7C0F13', role: 'Alert pills, icon badges, error surface tints' },
    ],
  },
  {
    id: 'semantic',
    title: 'Semantic & Status Palette',
    description: 'Strictly functional colors paired with accessible surface tints for journey states, availability, and validation.',
    tokens: [
      { name: 'Success / Ready', cssVar: '--ok', value: COLORS.ok, textOn: '#FFFFFF', role: 'Verified pickups, journey complete, POPIA assurance notes' },
      { name: 'Success Live Dot', cssVar: '--ok-bright', value: COLORS.okBright, textOn: '#0A0B0D', role: 'Online driver beacon and active status indicators on dark' },
      { name: 'Success Soft', cssVar: '--ok-soft', value: COLORS.okSoft, textOn: '#0F7B4F', role: 'Completion badges and ready-for-return banners' },
      { name: 'Warning / Attention', cssVar: '--warn', value: COLORS.warn, textOn: '#FFFFFF', role: 'Awaiting assignment/authorisation statuses and pickup alerts' },
      { name: 'Warning Soft', cssVar: '--warn-soft', value: COLORS.warnSoft, textOn: '#8A5A00', role: 'Amber status chip and pickup instruction backgrounds' },
      { name: 'Info / Dispatch', cssVar: '--info', value: COLORS.info, textOn: '#FFFFFF', role: 'Staff-assisted origin tags and assigned driver states' },
      { name: 'Info Soft', cssVar: '--info-soft', value: COLORS.infoSoft, textOn: '#1B5A8F', role: 'Blue status chip and staff-assisted tag background' },
      { name: 'In Transit (Violet)', cssVar: '--violet', value: COLORS.violet, textOn: '#FFFFFF', role: 'Donor onboard, driver arrived, returning home badges' },
      { name: 'Violet Soft', cssVar: '--violet-soft', value: COLORS.violetSoft, textOn: '#543680', role: 'Transit status chip background' },
    ],
  },
  {
    id: 'stealth',
    title: 'Stealth Dark Map Surface',
    description: 'Monochrome inverted OpenStreetMap tiles over a 48px dark architectural grid so white origin beacons and crimson routes stand out cleanly.',
    tokens: [
      { name: 'Stealth Void', cssVar: '--stealth-bg', value: COLORS.stealthBg, textOn: '#FFFFFF', role: 'Base canvas of all Leaflet maps and SVG route previews' },
      { name: 'Stealth Block', cssVar: '--stealth-block', value: COLORS.stealthBlock, textOn: '#FFFFFF', role: 'City block fills in schematic vector RouteMap' },
      { name: 'Stealth Road', cssVar: '--stealth-road', value: COLORS.stealthRoad, textOn: '#FFFFFF', role: 'Primary road lines in dark mode vector maps' },
      { name: 'Route Track Base', cssVar: '--stealth-route-base', value: COLORS.stealthRouteBase, textOn: '#FFFFFF', role: 'Untravelled route polyline beneath active crimson progress' },
    ],
  },
];

export const MAP_PALETTE = {
  stealth: {
    background: COLORS.stealthBg,
    blocks: COLORS.stealthBlock,
    blockStroke: COLORS.stealthBlockStroke,
    road: COLORS.stealthRoad,
    roadEdge: COLORS.stealthRoadEdge,
    routeBase: COLORS.stealthRouteBase,
    routeHalo: COLORS.accentRoute,
    route: COLORS.accentRoute,
    start: COLORS.white,
    startRing: COLORS.stealthBg,
    end: COLORS.accent,
    vehicle: COLORS.white,
    vehicleStroke: COLORS.carbon,
    label: '#181B22',
    labelText: '#F3F4F6',
    streetLabel: '#555D6E',
    park: COLORS.stealthPark,
  },
  light: {
    background: COLORS.paper2,
    blocks: '#E8EAEE',
    blockStroke: '#DCE0E6',
    road: COLORS.white,
    roadEdge: '#D1D5DB',
    routeBase: COLORS.mutedOnDark,
    routeHalo: COLORS.accent,
    route: COLORS.accent,
    start: COLORS.white,
    startRing: COLORS.carbon,
    end: COLORS.accent,
    vehicle: COLORS.carbon,
    vehicleStroke: COLORS.white,
    label: COLORS.white,
    labelText: COLORS.carbon,
    streetLabel: '#6B7280',
    park: '#E2E9E4',
  },
  pins: {
    centreSelectedFill: COLORS.accent,
    centreSelectedRing: COLORS.white,
    centreIdleFill: '#262A34',
    centreIdleRing: '#D1D5DB',
    centreIdleDot: '#6B7280',
    dropFill: COLORS.ink2,
    dropLiquid: COLORS.accent,
    dropStroke: COLORS.white,
    navHaloBorder: COLORS.accent,
    navArrowFill: COLORS.carbon,
  },
  chart: {
    darkGrid: 'rgba(255, 255, 255, .1)',
    darkLine: COLORS.accentBright,
    darkPointFill: COLORS.accentBright,
    darkPointStroke: COLORS.carbon,
    lightGrid: '#E5E7EB',
    lightLine: COLORS.accent,
    lightPointFill: COLORS.accent,
    lightPointStroke: COLORS.paper4,
  },
};

export const TYPOGRAPHY = {
  families: [
    {
      id: 'display',
      name: 'Manrope',
      cssVar: '--display',
      stack: "'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      weights: ['700 Bold', '800 ExtraBold'],
      usage: 'Display headlines, greeting banners, KPI figures, mobile sheet titles, wordmark',
      tracking: '-0.04em to -0.02em',
    },
    {
      id: 'font',
      name: 'Inter',
      cssVar: '--font',
      stack: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      weights: ['400 Regular', '500 Medium', '600 SemiBold', '700 Bold'],
      usage: 'Body prose, form inputs, navigation labels, tables, buttons, notifications',
      tracking: '-0.015em to 0em',
    },
    {
      id: 'mono',
      name: 'JetBrains Mono',
      cssVar: '--mono',
      stack: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
      weights: ['500 Medium', '600 SemiBold', '700 Bold'],
      usage: 'Booking references (SR-261127-008), uppercase micro kickers, telemetry labels, breadcrumbs',
      tracking: '0.07em to 0.24em',
    },
  ],
  scale: [
    { token: '--fs-3xl', sizePx: 36, lineHeight: '1.05', weight: 800, family: 'display', tracking: '-0.045em', role: 'Splash wordmark & desktop hero greeting' },
    { token: '--fs-2xl', sizePx: 30, lineHeight: '1.08', weight: 800, family: 'display', tracking: '-0.04em', role: 'Mobile greeting (`Hi Thabo`), console page H1' },
    { token: '--fs-xl', sizePx: 24, lineHeight: '1.15', weight: 800, family: 'display', tracking: '-0.035em', role: 'Auth heading, drawer H2, nav ETA metric' },
    { token: '--fs-lg', sizePx: 19, lineHeight: '1.18', weight: 700, family: 'display', tracking: '-0.03em', role: 'Section H2, modal titles, telemetry KPI numbers' },
    { token: '--fs-md', sizePx: 16, lineHeight: '1.30', weight: 700, family: 'display', tracking: '-0.02em', role: 'Card H3, trip receipt route, mobile input floor' },
    { token: '--fs-body', sizePx: 15, lineHeight: '1.50', weight: 400, family: 'font', tracking: '0em', role: 'Default body prose and form copy' },
    { token: '--fs-sm', sizePx: 13, lineHeight: '1.45', weight: 500, family: 'font', tracking: '-0.01em', role: 'Buttons, table cells, secondary descriptions' },
    { token: '--fs-caption', sizePx: 12, lineHeight: '1.40', weight: 600, family: 'font', tracking: '0em', role: 'Field labels, helper text, metadata rows' },
    { token: '--fs-label', sizePx: 11, lineHeight: '1.35', weight: 700, family: 'mono', tracking: '0.09em', role: 'Uppercase micro kickers, status pills, metric headings (minimum text size)' },
  ],
};

export const SPACING = [
  { token: '--sp-1', px: 4, rem: '0.25rem', usage: 'Tight icon gaps, hairline stack spacing' },
  { token: '--sp-2', px: 8, rem: '0.5rem', usage: 'Button icon gap, compact list spacing' },
  { token: '--sp-3', px: 12, rem: '0.75rem', usage: 'Bento grid gap, pill vertical padding, choice gap' },
  { token: '--sp-4', px: 16, rem: '1rem', usage: 'Card internal padding, mobile section gap' },
  { token: '--sp-5', px: 20, rem: '1.25rem', usage: 'Mobile page horizontal inset, card comfort padding' },
  { token: '--sp-6', px: 24, rem: '1.5rem', usage: 'Console page gutter, modal body padding' },
  { token: '--sp-7', px: 28, rem: '1.75rem', usage: 'Auth card padding, drawer/hero spacing' },
  { token: '--sp-8', px: 32, rem: '2rem', usage: 'Section separation in wide studio layouts' },
  { token: '--sp-10', px: 40, rem: '2.5rem', usage: 'Empty state padding, large desktop gutter' },
  { token: '--sp-12', px: 48, rem: '3rem', usage: 'Stealth grid cell size, icon disc scale' },
  { token: '--sp-16', px: 64, rem: '4rem', usage: 'Bottom sheet collapsed height, large stage inset' },
];

export const RADII = [
  { token: '--r-2xs', value: '8px', usage: 'Attribution chips, compact tags' },
  { token: '--r-xs', value: '12px', usage: 'Recent activity list rows, subtle highlights' },
  { token: '--r-sm', value: '16px', usage: 'Alert banners, nested centre options, compact tiles' },
  { token: '--r-md', value: '20px', usage: 'Inputs, profile pills, queue cards, shortcuts' },
  { token: '--r-lg', value: '24px', usage: 'Bento tiles, dark carbon pills, table wrappers' },
  { token: '--r-xl', value: '28px', usage: 'Hero telemetry cards, bottom sheets, route maps' },
  { token: '--r-2xl', value: '34px', usage: 'Large modal dialog frames' },
  { token: '--r-device', value: '46px', usage: '390×844 mobile phone preview bezel' },
  { token: '--pill', value: '999px', usage: 'Primary CTAs, status chips, circular docks, tabs' },
];

export const ELEVATION = [
  { token: '--sh-1', value: '0 1px 2px rgba(10, 11, 13, .05), 0 1px 1px rgba(10, 11, 13, .03)', usage: 'Subtle white KPI tiles & active segmented controls' },
  { token: '--sh-2', value: '0 6px 18px rgba(10, 11, 13, .07), 0 1px 3px rgba(10, 11, 13, .04)', usage: 'Map floating pills, controls & lightweight overlays' },
  { token: '--sh-3', value: '0 18px 46px rgba(10, 11, 13, .14), 0 2px 10px rgba(10, 11, 13, .06)', usage: 'Dropdown panels, stealth map preview cards' },
  { token: '--sh-ink', value: '0 18px 44px rgba(10, 11, 13, .28)', usage: 'Carbon telemetry heroes, account menus, toasts' },
  { token: '--sh-accent', value: '0 14px 28px rgba(212, 33, 39, .28)', usage: 'Primary crimson CTA banners & active dock discs' },
  { token: '--sh-dock', value: '0 12px 32px rgba(10, 11, 13, .10)', usage: 'Floating 4-button circular mobile dock' },
];

export const MOTION = {
  durations: [
    { token: '--dur-instant', value: '120ms', usage: 'Button press scale, table row hover' },
    { token: '--dur-fast', value: '160ms', usage: 'Dropdown chevrons, popover entrance, tab switches' },
    { token: '--dur-base', value: '240ms', usage: 'Drawer slide, map pan/re-center transitions' },
    { token: '--dur-slow', value: '380ms', usage: 'Bottom sheet expand/collapse, auth card entrance' },
    { token: '--dur-splash', value: '2100ms', usage: 'Opening animated logo splash hold duration' },
  ],
  easings: [
    { token: '--ease-standard', value: 'cubic-bezier(0.2, 0.8, 0.2, 1)', usage: 'Sheets, drawers, layout expansions' },
    { token: '--ease-out', value: 'cubic-bezier(0.22, 1, 0.36, 1)', usage: 'Splash emblem entrance, ECG stroke draw, auth card reveal' },
  ],
  keyframes: [
    { name: 'splash-heartbeat', duration: '1.5s', description: 'Double-beat systole/diastole pulse on the Crimson brand disc' },
    { name: 'splash-ring-pulse', duration: '2.0s', description: 'Expanding concentric radar rings echoing each beat' },
    { name: 'splash-ecg-draw', duration: '1.4s', description: 'Vector stroke-dashoffset trace across the SANBS QRS complex' },
    { name: 'splash-progress-fill', duration: '2.0s', description: 'GPU-composited scaleX(0→1) splash timer track' },
  ],
};

export const Z_INDEX = [
  { token: '--z-header', value: 60, layer: 'Sticky global carbon shell bar' },
  { token: '--z-scrim', value: 70, layer: 'Menu / notification dismissal scrims' },
  { token: '--z-menu', value: 80, layer: 'Account workspace switcher menu' },
  { token: '--z-popover', value: 200, layer: 'Notifications popover' },
  { token: '--z-drawer', value: 280, layer: 'Right-hand Journey Detail drawer' },
  { token: '--z-modal', value: 300, layer: 'Modal dialogs & staff-assisted booking' },
  { token: '--z-toast', value: 400, layer: 'Centered carbon status toast pill' },
  { token: '--z-sheet', value: 1100, layer: 'Mobile Journey expandable sheet & map banner' },
  { token: '--z-nav-overlay', value: 5000, layer: 'Full-viewport turn-by-turn driver navigation' },
];

export const AVATAR_TONES = [
  { id: 'red', label: 'SANBS Employed', hex: COLORS.accentDark },
  { id: 'blue', label: 'Fleet Reserve', hex: '#1F456E' },
  { id: 'plum', label: 'Independent Approved', hex: '#4F3A65' },
  { id: 'green', label: 'Transport Partner', hex: '#165B43' },
];

export const STATUS_CHIP_SPECS = [
  { key: 'awaiting_assignment', tone: 'amber', label: 'Awaiting driver', leg: 'Outbound' },
  { key: 'driver_assigned', tone: 'blue', label: 'Driver assigned', leg: 'Outbound' },
  { key: 'driver_on_the_way', tone: 'blue', label: 'Driver on the way', leg: 'Outbound' },
  { key: 'driver_arrived', tone: 'violet', label: 'Driver at pickup', leg: 'Outbound' },
  { key: 'donor_picked_up', tone: 'violet', label: 'Donor on board', leg: 'Outbound' },
  { key: 'awaiting_return_authorisation', tone: 'green', label: 'Donation in progress', leg: 'Centre' },
  { key: 'return_waiting_authorisation', tone: 'amber', label: 'Awaiting SANBS authorisation', leg: 'Return' },
  { key: 'return_awaiting_dispatch', tone: 'amber', label: 'Return ready to dispatch', leg: 'Return' },
  { key: 'return_driver_assigned', tone: 'blue', label: 'Return driver assigned', leg: 'Return' },
  { key: 'return_driver_on_the_way', tone: 'blue', label: 'Return driver on the way', leg: 'Return' },
  { key: 'return_driver_arrived', tone: 'violet', label: 'Return driver at pickup', leg: 'Return' },
  { key: 'donor_on_the_way_home', tone: 'violet', label: 'Returning home', leg: 'Return' },
  { key: 'completed', tone: 'green', label: 'Journey completed', leg: 'Final' },
  { key: 'cancelled', tone: 'grey', label: 'Cancelled', leg: 'Final' },
];

export const ACCESSIBILITY_RULES = [
  {
    id: 'contrast',
    title: 'WCAG 2.2 AA Contrast Enforced',
    metric: '>= 4.5:1',
    detail: 'All body text, muted metadata (#5A606D / #646B78 on light, #9CA3AF on #0A0B0D), crimson pills (#FFFFFF on #D42127 = 5.02:1), and semantic status chips meet or exceed 4.5:1 contrast.',
  },
  {
    id: 'touch-targets',
    title: '44 × 44 px Minimum Touch Targets',
    metric: '44 × 44 px',
    detail: 'On coarse pointers and viewports <= 760px, polish.css enforces 44px minimum hit areas across buttons, circular dock icons (52px), close triggers, and nav controls.',
  },
  {
    id: 'focus-rings',
    title: 'Adaptive Dual Focus Rings',
    metric: '2px solid',
    detail: 'Light surfaces display a #D42127 crimson focus outline; carbon and stealth dark surfaces flip automatically to high-visibility #FFFFFF focus outlines.',
  },
  {
    id: 'mobile-input-zoom',
    title: '16px Touch Input Floor',
    metric: '>= 16 px',
    detail: 'Auth and booking inputs scale up to 16px on touch / <= 760px viewports to prevent Safari iOS auto-zoom and horizontal panning.',
  },
  {
    id: 'reduced-motion',
    title: 'Prefers-Reduced-Motion Parity',
    metric: '0.01 ms',
    detail: 'All pulse loops, splash beats, ECG stroke animations, and sheet transitions collapse gracefully when prefers-reduced-motion: reduce is active.',
  },
  {
    id: 'popia-privacy',
    title: 'POPIA Operational Scope Only',
    metric: '0 clinical fields',
    detail: 'Transport interfaces display pickup, schedule, vehicle, and readiness flags only — clinical or donation test details are excluded from every UI pattern.',
  },
];

export const CONTRAST_PAIRS = [
  { id: 'ink-paper', label: 'Primary Ink on White Paper', fg: COLORS.ink, bg: COLORS.paper, minimum: 4.5 },
  { id: 'ink-paper2', label: 'Primary Ink on Cool Gray', fg: COLORS.ink, bg: COLORS.paper2, minimum: 4.5 },
  { id: 'muted-paper', label: 'Muted Ink on White Paper', fg: COLORS.muted, bg: COLORS.paper, minimum: 4.5 },
  { id: 'muted2-paper2', label: 'Muted 2 Ink on Cool Gray', fg: COLORS.muted2, bg: COLORS.paper2, minimum: 4.5 },
  { id: 'white-carbon', label: 'Pure White on Carbon', fg: COLORS.white, bg: COLORS.carbon, minimum: 4.5 },
  { id: 'mutedDark-carbon', label: 'Muted Dark Ink on Carbon', fg: COLORS.mutedOnDark, bg: COLORS.carbon, minimum: 4.5 },
  { id: 'white-accent', label: 'Pure White on SANBS Crimson', fg: COLORS.white, bg: COLORS.accent, minimum: 4.5 },
  { id: 'accent-paper', label: 'SANBS Crimson on White Paper', fg: COLORS.accent, bg: COLORS.paper, minimum: 4.5 },
  { id: 'accent-paper2', label: 'SANBS Crimson on Cool Gray', fg: COLORS.accent, bg: COLORS.paper2, minimum: 4.5 },
  { id: 'accentBright-carbon', label: 'Crimson Bright on Carbon', fg: COLORS.accentBright, bg: COLORS.carbon, minimum: 4.5 },
  { id: 'accentDeep-ghost', label: 'Crimson Deep on Error Ghost', fg: COLORS.accentDeep, bg: COLORS.accentGhost, minimum: 4.5 },
  { id: 'ok-soft', label: 'Success Text on Success Tint', fg: COLORS.ok, bg: COLORS.okSoft, minimum: 4.5 },
  { id: 'warn-soft', label: 'Warning Text on Warning Tint', fg: COLORS.warn, bg: COLORS.warnSoft, minimum: 4.5 },
  { id: 'info-soft', label: 'Info Text on Info Tint', fg: COLORS.info, bg: COLORS.infoSoft, minimum: 4.5 },
  { id: 'violet-soft', label: 'Transit Text on Violet Tint', fg: COLORS.violet, bg: COLORS.violetSoft, minimum: 4.5 },
];

function hexToRgb(hex) {
  const clean = String(hex).replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = Number.parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (val) => {
    const srgb = val / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foregroundHex, backgroundHex) {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
