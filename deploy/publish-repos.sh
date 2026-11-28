#!/usr/bin/env bash
# SANBS RIDE · publish the four role team apps as their own repositories.
#
#   OWNER=PAPI-12 VISIBILITY=private bash deploy/publish-repos.sh
#
# For each role (donor, driver, staff, ops) this script:
#   1. builds the prototype and packages that role (verified, path-relative),
#   2. stages the package as a static site root plus a GitHub Pages workflow,
#   3. creates sanbs-ride-<role>-app under OWNER (or reuses it if it exists),
#   4. pushes main, so each role then deploys and takes pull requests on its own.
#
# Run it from YOUR OWN GitHub login: creating repositories needs an account with
# repo-creation rights (the sandbox token used by the coding agent does not have
# them, which is why this step is yours). Re-run after any prototype change —
# existing repositories are updated, never recreated.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$ROOT_DIR/SANBS•RIDES"
OUT_ROOT="$ROOT_DIR/team-apps"

VISIBILITY="${VISIBILITY:-private}"
ROLES="${ROLES:-donor driver staff ops}"

command -v gh >/dev/null || { echo "✗ gh (GitHub CLI) is required" >&2; exit 1; }
command -v git >/dev/null || { echo "✗ git is required" >&2; exit 1; }
command -v npm >/dev/null || { echo "✗ npm is required" >&2; exit 1; }

gh auth status >/dev/null 2>&1 || { echo "✗ run: gh auth login" >&2; exit 1; }
OWNER="${OWNER:-$(gh api user --jq .login)}"
echo "SANBS RIDE role repositories → owner $OWNER, visibility $VISIBILITY"

# 1. One build serves all four roles.
echo "→ building the production bundle"
(cd "$APP_DIR" && npm ci && npm run build)

declare -A REPO_OF=( [donor]=sanbs-ride-donor-app [driver]=sanbs-ride-driver-app
                     [staff]=sanbs-ride-staff-app [ops]=sanbs-ride-ops-app )
declare -A LABEL_OF=( [donor]=Donor [driver]=Driver [staff]="Centre Staff" [ops]="Transport Ops" )

pages_workflow() {
  cat <<'YAML'
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Upload site
        uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
YAML
}

for role in $ROLES; do
  repo="${REPO_OF[$role]}"
  label="${LABEL_OF[$role]}"
  echo
  echo "════ $role → $OWNER/$repo"

  # 2. Package this role only.
  (cd "$APP_DIR" && npm run "package:$role")
  src="$OUT_ROOT/$role"
  [ -f "$src/index.html" ] || { echo "✗ packaging produced no site at $src" >&2; exit 1; }

  # 3. Stage the site as its own repository root.
  stage="$(mktemp -d)"
  cp -R "$src/." "$stage/"
  mkdir -p "$stage/.github/workflows"
  pages_workflow > "$stage/.github/workflows/pages.yml"
  git -C "$stage" init -q -b main
  git -C "$stage" add -A
  git -C "$stage" -c user.name="SANBS RIDE Bot" \
                  -c user.email="sanbs-ride@users.noreply.github.com" \
                  commit -q -m "SANBS RIDE · $label team app (role-pinned, deployable static site)"

  # 4. Create the repository when it does not exist yet, then push.
  if gh repo view "$OWNER/$repo" >/dev/null 2>&1; then
    echo "   repository exists — updating main"
  else
    gh repo create "$OWNER/$repo" "--$VISIBILITY" \
      --description "SANBS RIDE · $label team app — standalone role-pinned deployment" >/dev/null
    echo "   created $OWNER/$repo"
  fi
  git -C "$stage" remote add origin "https://github.com/$OWNER/$repo.git"
  git -C "$stage" push -q -u origin main --force
  echo "   pushed main"

  # 5. Point Pages at the GitHub Actions source (idempotent).
  if gh api "repos/$OWNER/$repo/pages" -X POST -f build_type=workflow >/dev/null 2>&1; then
    echo "   Pages enabled (GitHub Actions)"
  else
    gh api "repos/$OWNER/$repo/pages" -X PUT -f build_type=workflow >/dev/null 2>&1 \
      && echo "   Pages updated (GitHub Actions)" \
      || echo "   ! enable Pages manually: Settings → Pages → Source: GitHub Actions"
  fi

  rm -rf "$stage"
  echo "   ✓ https://$OWNER.github.io/$repo/"
done

echo
echo "✓ All four role apps published. Each repository now builds, deploys and"
echo "  reviews separately:"
for role in $ROLES; do
  echo "    https://github.com/$OWNER/${REPO_OF[$role]}"
done
echo
echo "Keep them in sync: run one shared relay (node deploy/sync-server.mjs) and set"
echo "window.SANBS_SYNC_DEFAULT in each role's app-config.js — see deploy/DEPLOY_ROLES.md."
