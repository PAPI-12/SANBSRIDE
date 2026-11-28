# Deploying the four SANBS RIDE role apps separately

One production build produces **four standalone, role-pinned apps**. Each one is
a complete static site that can be built, versioned, released and hosted on its
own — no team-switching nav inside them; every team is opened in its own window
or on its own URL.

| Role | Pin (`window.SANBS_TEAM_APP`) | Package folder | Zip | Workflow | Repository |
| --- | --- | --- | --- | --- | --- |
| Donor | `donor` | `team-apps/donor` | `sanbs-ride-donor-app.zip` | `.github/workflows/deploy-donor.yml` | `sanbs-ride-donor-app` |
| Driver | `driver` | `team-apps/driver` | `sanbs-ride-driver-app.zip` | `.github/workflows/deploy-driver.yml` | `sanbs-ride-driver-app` |
| Centre staff | `staff` | `team-apps/staff` | `sanbs-ride-staff-app.zip` | `.github/workflows/deploy-staff.yml` | `sanbs-ride-staff-app` |
| Transport ops | `operations` | `team-apps/ops` | `sanbs-ride-ops-app.zip` | `.github/workflows/deploy-ops.yml` | `sanbs-ride-ops-app` |

Role metadata lives in one place — the `ROLES` table at the top of
`SANBS•RIDES/scripts/package-team-app.mjs`. `SANBS•RIDES/test/teamApps.test.js`
fails CI if a pin drifts away from `ROLE_ORDER` in `src/App.jsx`, if a role loses
its workflow, or if a package stops being path-relative.

## Build a role package locally

```bash
cd SANBS•RIDES
npm ci && npm run build
npm run package:donor      # or package:driver / package:staff / package:ops
npm run package:all        # all four, each verified
```

Output lands in `../team-apps/<role>/` plus a matching zip. Archives are written
by the packager itself with a fixed timestamp, so the same source tree always
produces byte-identical zips (`--verify` also proves every relative reference
resolves, the role is pinned, and no root-absolute path survived).

## Route A — one repository, four host projects (fastest)

Create one project per role on the same host. Every package is path-relative, so
sub-directory hosting works too.

| Host | Build command | Publish directory |
| --- | --- | --- |
| Netlify | `cd SANBS•RIDES && npm ci && npm run build && npm run package:donor` | `team-apps/donor` |
| Vercel | same, with `--role donor` | `team-apps/donor` |
| Cloudflare Pages | same | `team-apps/donor` |

Repeat with `driver`, `staff`, `ops` for the other three projects. Each project
gets its own URL, its own deploy history and its own rollbacks.

## Route B — GitHub Actions in this repository

Each role has its own workflow, so they can be run independently:

- **Actions tab → `Deploy · Donor app` → Run workflow** packages only that role
  and uploads the `sanbs-ride-donor-app` artifact (deployable folder **and** zip).
- A push to `main` refreshes all four artifacts.
- Publishing a GitHub Release attaches all four zips to it, one per role.
- The `publish_pages` input deploys that single role to this repository's GitHub
  Pages site (Pages serves one site per repository — use Route A or C for four
  permanent URLs at once).

`SANBS RIDE CI` also packages and verifies all four roles on every push and pull
request, and uploads them as the `sanbs-ride-team-apps` artifact.

## Route C — four dedicated repositories

When each role needs its own repository (own issues, own Pages URL, own review
flow), run the publisher **from your own GitHub login** — creating repositories
needs an account with repo-creation rights:

```bash
OWNER=PAPI-12 VISIBILITY=private bash deploy/publish-repos.sh
```

For each role it packages the app, adds a static GitHub Pages workflow, creates
`sanbs-ride-<role>-app`, and pushes `main`. Each repository then deploys to
`https://<owner>.github.io/sanbs-ride-<role>-app/` with no build step, and takes
its own pull requests from then on. Re-run the script after any prototype change
to push an updated build; existing repositories are updated, never recreated.

## Keeping all four deployments in sync

The apps are separate, the data is not. Run **one** shared relay:

```bash
node deploy/sync-server.mjs        # 0.0.0.0:8787, override with PORT
```

Then point each deployed app at it — either open it with
`?sync=https://relay-host/state`, or set `window.SANBS_SYNC_DEFAULT` in that
role's `app-config.js` before uploading:

```js
window.SANBS_TEAM_APP = 'donor';
window.SANBS_SYNC_DEFAULT = 'https://relay-host/state';
```

Clients poll every 1500 ms and push debounced at 450 ms, so bookings, drivers,
notifications and accounts mirror across every window and every deployment
within ~1.5 s. Windows served from the same origin sync without the relay via
shared storage events. The relay validates that any incoming state carries
`bookings` and `drivers` arrays and rejects anything else with HTTP 422.
