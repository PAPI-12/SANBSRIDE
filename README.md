# SANBS RIDE

Free, coordinated donor transport for SANBS donation centres across Gauteng —
the animated brand splash, donor booking, driver trips, centre-staff arrivals and
transport-operations dispatch in one product.

## Repository layout

| Path | What it is |
| --- | --- |
| `SANBS•RIDES/` | The product: Vite + React prototype, design tokens, brand artwork, tests, SSR check |
| `deploy/` | Per-role deployment guide, the shared sync relay, and the four-repository publisher |
| `.github/workflows/ci.yml` | Brand verification, tests, build, SSR check, and packaging of all four roles |
| `.github/workflows/deploy-*.yml` | One independent deploy workflow per role (donor, driver, staff, ops) |
| `team-apps/` | Generated, never committed — run `npm run deploy:all` to recreate it |

## Run it

```bash
cd SANBS•RIDES
npm ci
npm run dev          # local prototype
npm run ci           # brand verify → tests → build → SSR check
```

## Deploy the four role apps separately

One build produces four standalone, role-pinned apps — donor, driver, centre
staff and transport ops — each with its own workflow, artifact, zip and
repository path. There is no team switcher inside them; every team is its own
deployment, opened in its own window.

```bash
npm run deploy:donor   # → team-apps/donor  (+ sanbs-ride-donor-app.zip)
npm run deploy:driver  # → team-apps/driver
npm run deploy:staff   # → team-apps/staff
npm run deploy:ops     # → team-apps/ops
npm run deploy:all     # all four, each verified
```

Hosting routes (four projects on one repository, GitHub Actions per role, or four
dedicated repositories) and the sync relay that keeps every deployment in step
are documented in **[deploy/DEPLOY_ROLES.md](deploy/DEPLOY_ROLES.md)**.
