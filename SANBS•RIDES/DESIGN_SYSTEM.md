# SANBS RIDE Design System (`v2.0.0`)

**Visual Language:** Monochrome + SANBS Crimson Red + Stealth Dark Maps  
**Target Roles:** Donor & Driver (390×844 Mobile Shell) · SANBS Staff & Transport Operations (Desktop Carbon Console)  
**Compliance:** WCAG 2.2 AA (`>= 4.5:1` verified text contrast) · 44×44 px touch targets · POPIA operational data boundary  

---

## 1. Philosophy & Principles

1. **Stark Clinical Contrast:** Primary reading surfaces use pure white (`#FFFFFF`) against neutral stage backdrops (`#ECEEF2`) and architectural carbon frames (`#0A0B0D`).
2. **Single Bold Brand Accent:** SANBS Crimson Red (`#D42127`, shifting to `#FF4D53` on carbon and `#FF3B42` on stealth maps) is reserved exclusively for primary CTAs, active navigation markers, active route geometry, and live progress indicators.
3. **Stealth Cartography:** OpenStreetMap tiles are desaturated and inverted (`#0F1115` backdrop) so white origin beacons and crimson route lines read effortlessly in bright daylight or dim vehicles.
4. **Role-Matched Ergonomics:** Field roles (`Donor`, `Driver`) operate inside a focused handheld phone chassis with floating circular docks and expandable bottom sheets, while hub roles (`Staff`, `Operations`) operate in persistent `220px` carbon-sidebar consoles.
5. **Operational Privacy (POPIA):** Transport UI patterns strictly expose pickup location, schedule window, readiness sign-off, and vehicle assignment—never medical or donor-screening details.

---

## 2. Architecture & Single Source of Truth

| Artifact | Purpose |
| --- | --- |
| `src/design-system/tokens.js` | Canonical JS constants (`COLORS`, `MAP_PALETTE`, `TYPOGRAPHY`, `SPACING`, `RADII`, `ELEVATION`, `MOTION`, `Z_INDEX`, `BRAND_ARTWORK`, `CONTRAST_PAIRS`, `contrastRatio`) |
| `src/design-system/tokens.css` | Canonical `:root` CSS custom properties imported before component layers |
| `src/design-system/primitives.jsx` | Composable UI primitives (`Button`, `Kicker`, `SurfaceCard`, `TelemetryStrip`, `RouteStopStack`, `SplitCtaBanner`, `CircularDock`, `SanbsDropPin`, `EcgPulseLine`, `ChoiceOption`) |
| `src/design-system/components.css` | Shared primitive styles for telemetry modules, surface cards, route stacks, and choices |
| `src/design-system/DesignSystemView.jsx` | Interactive in-app Design System Studio (accessible from the Account Menu, Auth footer, or `#design-system`) |
| `src/design-system/showcase.css` | Responsive styles for the Design System Studio down to 320px |
| `test/designSystem.test.js` | Automated token parity (`tokens.js` vs `tokens.css` vs `domain.js`), manifest alignment, and WCAG AA contrast assertions |

### CSS Cascade Order (`src/main.jsx`)
```text
leaflet/dist/leaflet.css
  → src/design-system/tokens.css
  → src/design-system/components.css
  → src/design.css
  → src/mobile.css
  → src/console.css
  → src/desktop.css
  → src/polish.css
  → src/design-system/showcase.css
```

---

## 3. Color System & Verified WCAG AA Pairs

### Ink, Carbon & Neutrals
| Token | Hex | Role |
| --- | --- | --- |
| `--carbon` / `--ink` | `#0A0B0D` | Global header, sidebars, telemetry hero cards, dark auth stage |
| `--carbon-2` | `#14161B` | Nested interactive rows on carbon surfaces |
| `--carbon-3` | `#1F2229` | Carbon hover state & progress track background |
| `--carbon-line` | `#262A33` | 1px hairlines inside dark consoles |
| `--muted` | `#5A606D` | Secondary copy and field metadata (`6.31:1` on `#FFFFFF`) |
| `--muted-2` | `#646B78` | Supporting captions (`4.87:1` on `#F3F4F6`) |
| `--muted-on-dark` | `#9CA3AF` | Secondary labels on `#0A0B0D` (`7.76:1`) |
| `--canvas` | `#ECEEF2` | Desktop stage & PWA background |
| `--paper` | `#FFFFFF` | Primary cards, handheld viewport, modals, drawers |
| `--paper-2` | `#F3F4F6` | Cool gray inputs, pills, and compact surfaces |
| `--paper-4` | `#F6F7F8` | Soft receipt rows and quiet list surfaces |

### SANBS Crimson & Functional Semantics
| Token | Hex | Role |
| --- | --- | --- |
| `--accent` | `#D42127` | Primary pills, brand mark, active dock disc, focus rings (`5.19:1` white text) |
| `--accent-dark` | `#B0171D` | Hover/pressed crimson (`6.79:1` with white text) |
| `--accent-deep` | `#7C0F13` | Validation error text on `#FFF5F5` (`10.15:1`) |
| `--accent-bright` | `#FF4D53` | ECG trace, metrics & highlights on `#0A0B0D` (`6.04:1`) |
| `--accent-route` | `#FF3B42` | Travelled route line & glow on stealth maps |
| `--ok` / `--ok-soft` | `#0F7B4F` / `#E6F4EC` | Journey complete & verified pickups (`4.67:1`) |
| `--warn` / `--warn-soft` | `#8A5A00` / `#FDF3DC` | Awaiting assignment/authorisation (`5.37:1`) |
| `--info` / `--info-soft` | `#1B5A8F` / `#E8F1F9` | Assigned driver & staff-assisted badges (`6.33:1`) |
| `--violet` / `--violet-soft` | `#543680` / `#EFEAF8` | Driver arrived / Donor onboard (`8.03:1`) |

---

## 4. Typography & Scale

Three self-hosted `@fontsource` families power all surfaces:
- **Display (`--display`) — `Manrope` (700, 800):** Display greetings, KPI readouts, wordmarks, tight tracking (`-0.045em` to `-0.02em`).
- **UI Body (`--font`) — `Inter` (400, 500, 600, 700, 800):** Forms, table cells, navigation, notifications.
- **Technical Mono (`--mono`) — `JetBrains Mono` (500, 600):** Booking IDs (`SR-261127-008`), uppercase kickers (`--fs-label` 11px, `0.09em` tracking).

---

## 5. Spatial System, Radii & Motion

- **Spacing Scale (`4px` base):** `--sp-1` (`4px`) through `--sp-16` (`64px`).
- **Radii:** Pill-first controls (`--pill: 999px`), generous cards (`--r-lg: 24px`, `--r-xl: 28px`, `--r-2xl: 34px`), and `46px` device bezel (`--r-device`).
- **Motion Curves:**
  - `--ease-standard`: `cubic-bezier(0.2, 0.8, 0.2, 1)` for sheets, drawers, and map re-centering.
  - `--ease-out`: `cubic-bezier(0.22, 1, 0.36, 1)` for splash entrance and ECG stroke draw.
  - All looping/entering animations collapse to `0.01ms` under `@media (prefers-reduced-motion: reduce)`.

---

## 6. Accessibility & Browser Support Rules

- **Adaptive Focus Rings:** Light containers apply `#D42127` focus outlines; carbon and dark containers apply `#FFFFFF` focus outlines (`polish.css`).
- **Touch Floor:** All controls enforce `>= 44×44 px` touch targets on coarse pointers and `<= 760px` viewports.
- **iOS Auto-Zoom Prevention:** All form inputs step up to `16px` font size on touch / narrow screens.
- **Interactive Preview:** Run `npm run dev` to play with the 14 journey states, vector/stealth maps and live telemetry. The full token, WCAG and CI boards live in the separate **Design System Studio** download (`design-system-studio/`, zip at the workspace root) — the prototype itself stays product-only.

---

## 7. Corporate Identity (CI) & Automated Logo CI Pipeline

- **Canonical Mark (`280 × 180` viewBox):** Geometric lowercase **`ride`** wordmark crowned by the **original SANBS intertwined-hearts droplet** above the **`i`**, a continuous road-smile arc sweeping flush under **`r–i`**, and the **original SANBS wordmark type** in crimson tucked under **`d–e`**.
- **Surface Rules:**
  - **Paper (`#FFFFFF` / `#F2F2F2`):** `#0A0B0D` Carbon letters + `#D42127` Crimson SANBS droplet & SANBS type (`sanbs-ride-mark.svg`, `sanbs-ride-mark-ink.svg`, `1200×1200` master sheet).
  - **Carbon (`#0A0B0D`):** `#FFFFFF` Pure White letters + `#E62E35` SANBS Crimson accents (app header, Sign in / Sign up shell).
  - **Crimson (`#D42127`):** All-white lockup with white ripple waves — the opening splash surface, `180×180` `apple-touch-icon.png`, and the `48×48` `favicon.svg` squircle (`sanbs-ride-mark-white.svg`, `sanbs-ride-icon.svg`).
- **One Continuous Red Sea (splash → Sign in):** Both auth screens live inside a single shared stage (`.auth-flow-stage`) on solid SANBS Red — three pure parallax wave bands (no heartbeat lines) drifting on perfect 720-unit tiling, with the waterline starting at exactly half the screen height. Because the sea is mounted once inside `AuthFlow`, the waves never restart between screens: on hand-off the sea swells (`stage-swell`) to carry the Sign in card up on the crest (`auth-card-enter` from 52px) while the splash content lifts away — no loader, no colour change, no seam.
- **Splash Entrance:** the SANBS droplet falls from the top of the viewport and lands on the “i” with a soft squash, releasing white ripple rings from the impact point (`.auth-splash-dropfall` + `.auth-splash-ripple`).
- **Individual Team Apps (separate downloads, live-synced):** the prototype carries no team-app UI — only an invisible `window.SANBS_TEAM_APP` pin used by the standalone builds. Four self-contained production bundles (`donor/`, `driver/`, `staff/`, `ops/` inside `SANBS-RIDE-team-apps.zip` at the workspace root) deploy independently to any static host; each `app-config.js` sets `window.SANBS_TEAM_APP`, pinning the workspace with **no in-app team switching or team nav** — teams are reached only by opening their own app window. Same-origin windows sync through storage events; different hosts sync through the bundled zero-dependency relay (`sync-server.mjs`, `GET/PUT /state`) via `?sync=https://relay` or `window.SANBS_SYNC_DEFAULT`, mirroring bookings, drivers, notifications and accounts within ~1.5 s. `team-apps/publish-repos.sh` publishes each package as its own repository.
- **Design System Studio (separate download):** the complete token, WCAG, brand & CI boards ship as their own static app (`design-system-studio/`, `SANBS-RIDE-design-system-studio.zip`) with sources included; the prototype keeps only the token files its product UI consumes.
- **Continuous Integration (`npm run ci` & `.github/workflows/ci.yml`):**
  1. `npm run brand:verify` (`scripts/verify-logo.mjs`) validates SVG vector path sync, blood-drop path integrity, PNG dimensions, first-screen `AuthFlow` integration, and zero legacy `76.02 100` remnants.
  2. `npm test` (`node --test`) validates CSS/JS token parity, WCAG 2.2 AA contrast, domain status parity, and all `STUDIO_MEDIA` / `BRAND_ARTWORK` assets.
  3. `npm run build` runs the Vite production bundle.
  4. `npm run check:ssr` (`scripts/check-ssr.mjs`) verifies Vite SSR output for `AuthFlow` (`splash` & `login`) and `App`.

