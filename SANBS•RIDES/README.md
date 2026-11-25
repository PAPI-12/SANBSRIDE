# SANBS RIDE — donor transport prototype

A demonstration prototype for booking and coordinating donor transport to SANBS donation centres. It has four workspaces: **Donor**, **Driver**, **SANBS Staff** and **Transport Operations**. All data is fictional and stored only in the browser.

> This is a demo prototype, not a production SANBS service. Use fictional sample data only. Donor data is health-adjacent; see the POPIA notes in `AUDIT.md` before using real information.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (see `.nvmrc`; Vite 8 needs it)
- npm
- Internet access for OpenStreetMap tiles, address search and road routing. The app still works without them (see *Resilience* below).

## Run it

```bash
npm ci          # install exact dependencies from package-lock.json
npm run dev     # development server
```

To serve the production build:

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test        # domain logic, state normalisation, routing fallback (node --test)
```

## Demo walkthrough (about five minutes)

The sample donor, Thabo Mokoena, already has a ride in progress. The driver, James Peterson, is approaching the pickup point. The approach takes 90 seconds and the trip to the centre 120 seconds. Each time the app opens, the sample approach restarts, so a presentation always begins with the driver on the road. Use Reset demo data in the account menu to start the sample afresh.


1. Open the app. It starts in the **Donor** workspace, where the drop fills as the driver approaches.
2. To make a new booking, reset the demo data, then tap **Request this ride**, keep the Sandton Donor Centre, and press **Continue** then **Request ride**.
3. Use the account menu (top right) to switch to **Transport Ops**. Assign a driver to the outbound leg from the Dispatch view.
4. Switch to **Driver**. The trip shows the route and a navigation view.
5. Switch to **SANBS Staff** to see the shared arrival board and the journey log.
6. Use **Reset demo data** in the account menu to restore the sample journeys.

## Resilience

- Map tiles, address search and road routing are public services. Requests time out after 8 seconds and retry once.
- If road routing is unavailable, the map draws a labelled straight-line route marked *Approximate*.
- If address search is unavailable, the sample donor's saved address still works because it has a verified position.
- The app shows a plain-language message and a Try again action for any service that fails. Public OpenStreetMap, Nominatim and OSRM demo servers have usage limits and no uptime guarantee.

## Layout

- Donor and driver screens are designed at phone size (390 × 844). On phones they run full screen; on larger screens they appear in a scaled phone frame.
- Staff and Operations are desktop consoles that scroll normally and adapt down to 320px.

## Project layout

- `src/App.jsx` — shell, header, account menu, notifications, role switching
- `src/roles/` — Donor, Driver, Staff and Operations workspaces (code-split)
- `src/components/` — shared UI, journey map, donation-centre picker, modals
- `src/domain.js` — data model, seeds, state normalisation and journey logic
- `src/services/` — address search, routing and the shared fetch helper
- `src/*.css` — design tokens and layouts; `src/polish.css` is the final layer that holds the review-pass fixes
- `test/` — unit tests
- `public/` — icons, manifest and favicon

Git metadata, `node_modules/` and `dist/` are not part of this bundle.
