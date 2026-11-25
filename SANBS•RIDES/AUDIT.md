# SANBS RIDE — prototype audit and fix log

This log records what was tested, what was found, what was fixed, the evidence, and what remains. It covers a prototype-level tech-stack audit, not a full security or production review.

## Method

- **Build and dependencies:** `npm ci`, `npm run build`, `npm test`, `npm audit`, `npm outdated`.
- **Browser audit:** headless Chromium on 7 viewports (320×568, 360×740, 390×844, 430×932, 768×1024, 1280×720, 1920×1080) for all four roles. Measured horizontal overflow, console and page errors, undersized controls and heading count, with screenshots.
- **Accessibility:** axe-core scan of each role at 390px and 1280px.
- **Interaction:** scripted checks for the account menu, notifications, role switching and the request flow. Plus one full donor booking to confirmation.

## Dependency and stack results

| Check | Before | After |
|---|---|---|
| `npm audit` | 0 vulnerabilities | 0 vulnerabilities |
| Unit tests | 12 pass | 14 pass (adds routing fallback tests) |
| Production build | Single 397 KB JS bundle | Code-split: 220 KB entry plus per-role chunks |
| Fonts | Render-blocking Google Fonts | Self-hosted via `@fontsource` (Latin subsets) |
| Node | `^20.19.0 \|\| >=22.12.0` | Same, plus `.nvmrc` pinned to 22 |

Outdated (deliberately not upgraded in this pass): `react` and `react-dom` 18.3 → 19.x, and `lucide-react` 0.468 → 1.x. Upgrading React 19 touches the rendering and effect model across all four roles and needs its own test pass. Recommendation: defer until after the demo.

## Findings and fixes

| # | Finding (before) | Fix | Evidence (after) |
|---|---|---|---|
| 1 | Phone scaling ignored the app header, so pages overflowed vertically at every size (e.g. 900px vs 844px). Scaling could enlarge to 1.17× on tablets. | Scale computed from the real stage size, capped at 1×, applied with CSS `zoom` (layout-aware). | Donor 1280×720: phone fits, scale 0.73. No overflow. |
| 2 | On a 390px phone a bezel and rounded frame were still drawn, and the bottom nav was clipped. Cause: a later fine-pointer rule overrode the small-screen rule. Frame rules were spread across 55 selectors. | Two competing frame blocks removed; one authoritative rule set appended to `mobile.css`. | Phone width: full bleed, no bezel. Bottom nav visible at 390×844. |
| 3 | All four role apps mounted at once, so hidden roles ran effects and network calls (e.g. the donor view geocoded the driver's address). | Only the active role renders, each lazy-loaded with Suspense. | Role switch test: donor unmounted when driver is active. |
| 4 | Duplicate `<h1>` on every screen (four per page). | Single active role gives one `h1`. | Heading count 1 on all roles and sizes. |
| 5 | Staff rail overflowed the viewport at 320px (content to 350px). | Grid columns `minmax(0,1fr)` and `min-width:0` on console containers. | Staff 320×568: no overflow. |
| 6 | Staff and Operations: breadcrumb collided with page title; "Dispatch" clipped by pill; duplicate bell in topbar; tab row clipped with no scroll cue. | Breadcrumb truncates and hides its prefix on narrow screens; duplicate bell removed (the global header bell remains); tab row scroll-fades. | Staff 320 screenshot: clean header. |
| 7 | Operations driver avatar "SD" squashed into an ellipse (flex-shrink and inherited flex: 1). | `flex: none`, fixed 26px size, `justify-self: start` on avatars. | Measured 26×26 at 390. |
| 8 | Driver app used UTC dates (`toISOString().slice(0,10)`), wrong near midnight in South Africa. Greeting hardcoded to "Good morning". | `localDateString()` (Johannesburg time) and a time-aware greeting using `Africa/Johannesburg`. | Driver greeting follows time of day. |
| 9 | Map: 10 Hz re-render tick, no pause when tab hidden, error card overlapped zoom controls and showed "Failed to fetch". | Tick reduced to 4 Hz and paused when the page is hidden. Errors are plain-language with Try again, and map controls hide while in error. | Error state checked in browser. |
| 10 | Map had no fallback when road routing failed: an error and no map. | Requests time out at 8s with one retry. Failure falls back to a labelled straight-line route ("Approximate route"). | Unit tests for `approximateRoute`; approximate chip shown when OSRM is blocked. |
| 11 | Address search failure blocked donor booking entirely (no verified pickup point, search offline). | Sample donor address and sample staff booking now have verified coordinates. Saved profile addresses fall back to the seed position. | Booking test completes to a journey reference (SR-…-009) with the search service blocked. |
| 12 | Account menu and notification popover did not close on Escape or outside click, and had no arrow-key navigation. Focus was not returned. | Escape closes and returns focus to the trigger; outside-click scrim on notifications; arrow keys and Home/End move through the menu. | Scripted checks: all PASS. |
| 13 | Accessible names: account button, notification button and operations tabs had names that did not contain their visible text; 4 unnamed buttons. | Names built from visible text; redundant `aria-label`s removed; mobile account name kept in the accessible name via visually hidden text. | axe `label-content-name-mismatch` and `button-name`: 0. |
| 14 | 24 colour-contrast failures (muted text on white and dark console; red-on-pink nav labels). | `--muted-2` darkened; targeted colour fixes on tinted surfaces; donor and staff text tuned. | axe `color-contrast`: 0. |
| 15 | No visible keyboard focus on console controls; reduced-motion handled only in `mobile.css`; text as small as 8px. | Global `:focus-visible` ring; reduced motion in every stylesheet; minimum 11px text (declarations raised). | Verified by axe and build; visual check of focus rings is a manual step. |
| 16 | Touch targets: 2–16 controls per screen under 44px on phones. | 44px minimum on touch and phone-width layouts, including explicit heights. | Phones and tablets: 1–6 controls per screen still under 44px (see Deferred). |
| 17 | Hidden map container had `role="img"` hiding its interactive content. | Replaced with a screen-reader text summary of the route. Map is not hidden from assistive tech. | axe `aria-hidden-focus`: 0. |
| 18 | Google Fonts render-blocking; iOS home-screen icon was SVG (ignored by iOS). | Self-hosted fonts; PNG 180×180 apple-touch-icon; web manifest; Open Graph tags; noscript message. | Build output includes self-hosted font files. |
| 19 | Stray `design-options/` and `Ui options/` folders in the project. | Removed from the deliverable (originals are in the uploaded zip). | Not in package. |
| 20 | README described a committed `node_modules/` and `dist/`, which should not be in a repo. | README rewritten: install, run, test, walkthrough, resilience, layout notes. | `README.md`. |

## Final browser evidence

- **Overflow:** 0 horizontal overflow across 4 roles × 7 viewports (28 combinations).
- **Console:** 0 application errors. The only browser errors come from the sandbox blocking external services (address search, Google Fonts earlier). Expected offline.
- **axe-core:** 0 violations at 390px and 1280px for all four roles.
- **Undersized controls (under 44px):** 1 to 6 per screen on phones and tablets, down from 2–16. Desktop consoles use 24–36px controls, which meets WCAG 2.2 AA (24px) but not the 44px target size.
- **Tests:** 14 unit tests pass. 10 interaction checks pass. Donor booking completes.

## Deferred (not done in this pass)

- **Linting and CI:** ESLint, Prettier and a GitHub Actions workflow are not added yet.
- **End-to-end tests:** the browser checks above are scripts, not a committed Playwright suite.
- **Content-Security-Policy:** not yet added. Needs a test pass against tiles, geocoder, router and fonts.
- **Lighthouse:** not run; no before/after performance numbers recorded.
- **Route precomputation:** seeded routes are not stored as static JSON. Fallback is the straight-line route.
- **Persona naming:** fallback names in `ROLE_ACCOUNTS` still differ from seeds in some places.
- **Demo guide panel:** the walkthrough is in the README only.
- **React 19 and lucide-react 1.x:** deferred (see the dependency section).
- **Large-file split:** `App.jsx` and the role files are still large. The role code-splitting addresses bundle size, not file size.

## Prototype → product: what's needed

1. **Backend and auth:** a real API, sessions and per-role access control. The current app is single-browser localStorage with no security boundary.
2. **Real-time updates:** replace storage-event sync with a server push channel.
3. **POPIA compliance:** donor data (contact details, pickup addresses, appointment info, health-adjacent context) needs a lawful basis, retention rules, consent records, access logging and a privacy notice. Keep fictional data until this exists.
4. **Routing and geocoding:** a commercial or self-hosted provider with an SLA, plus licence terms for the map tiles.
5. **Accessibility and language:** a formal audit against WCAG 2.2 AA with real assistive-technology testing. Support for isiZulu, Sesotho and Afrikaans should be considered with SANBS.
6. **Operations:** monitoring, error reporting to a secured endpoint, CI/CD with the checks listed above, and a dependency update policy.

## Presentation pass (v2)

Focus: the driver map, the donor drop and first-screen layout, for a live demo.

| # | Finding | Fix | Evidence |
|---|---|---|---|
| P1 | Driver car was placed at the driver's stored position, so it never moved along the route. Whether it moved depended on which windows were open. | The car is placed by the shared journey timeline. Only a live GPS fix from the driver's device (under 15 seconds old) overrides it. | Driver alone, driver beside donor, and donor-first runs all show the same motion. |
| P2 | Donor drop stayed empty during the driver's approach and had no timer, so it did not update. | The drop fills 0–50% during the approach and 50–100% during the trip, and re-renders while a journey moves. | Live run: 0% → 4% → 9% → 14% over 26 seconds, matching the driver's position. |
| P3 | Sample trip belonged to a different donor ("Musa Dube") from the signed-in donor, so the donor saw "No ride booked". | The sample trip belongs to the signed-in donor. Saved demos from older versions are rebuilt on open. | Donor home shows the active ride. |
| P4 | Sample trip started eight minutes before the app opened, so the car was already parked at the pickup point. | Approach is 90 seconds and the trip 120 seconds. The sample approach restarts on each app open. | Timeline checks in unit tests. |
| P5 | Phone sat in the top-left corner with empty space beside it (flex centring failed with CSS zoom). | Frame centred with auto margins. Scale floor of 0.8× so it stays readable; shorter windows scroll inside the stage. | Measured centre matches the stage centre at 1440×900. |
| P6 | Drop was clipped at the card's right edge at laptop sizes. | Drop width capped to its card. | Visual check at 1440×900. |
| P7 | Journey stepper labels ran into each other. | Labels reduced to 11px and wrap within their columns. | Visual check. |
| P8 | Driver map card was too small to show the route and both pins. | Map frame 260px tall. Map fits the route plus both pins, with padding for on-map controls. | Visual check at 1280×800. |
| P9 | "Approximate route" notice was a large blob covering the car. | Compact single-line pill. | Visual check. |
| P10 | Donor ride-details strip could not be reached by keyboard. Small labels failed contrast. | Strip is focusable and labelled. Label colour and opacity corrected. | axe-core: zero violations for all roles at 390 and 1280px. |

### Verification after the presentation pass

- Unit tests: 15 pass (new tests cover the whole-journey drop and the shared timeline).
- Interaction checks: 10 pass. Booking completes to a journey reference.
- Overflow sweep: no horizontal overflow at any of 7 sizes for all 4 roles.
- Accessibility (axe-core): zero violations at 390 and 1280px for all roles.

### Still needs your check before presenting

- **Sample coordinates.** The seeded donation centre sits roughly 200 metres from the sample pickup, so their pins overlap on the map. I could not verify the real SANBS Sandton donor centre address or coordinates from here. My search found the SANBS Fourways donor centre at 11 Sunset Avenue, Sandton, but not a Rivonia Road site. Replace the centre's coordinates in `src/domain.js` (LOCATIONS) and the sample pickup coordinates (donor profile and seed booking) with verified values.
- **Small touch targets on laptop-width consoles** are 24–36px, which meets WCAG 2.2 AA's 24px minimum.
- **Route accuracy.** When the public routing service is reachable, the map shows the road route. In this sandbox it was blocked, so every check used the labelled straight-line approximation. Confirm the road route on your machine.
