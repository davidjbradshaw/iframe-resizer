#!/bin/bash
set -euo pipefail

# Build a single e2e framework app into e2e/fixtures/<framework>/
# Usage: build-e2e-app.sh <framework>

FRAMEWORK=${1:?Usage: build-e2e-app.sh <framework>}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
APP_DIR="$ROOT/e2e/apps/$FRAMEWORK"

if [ ! -d "$APP_DIR" ]; then
  echo "No e2e app for $FRAMEWORK (skipping build)"
  exit 0
fi

# Skip if the whole spec is marked as skipped. Anchored, so a mention of
# describe.skip in a comment or a string does not skip the build
SPEC="$ROOT/e2e/tests/$FRAMEWORK.spec.js"
if [ -f "$SPEC" ] && grep -qE '^[[:space:]]*(test\.)?describe\.skip' "$SPEC"; then
  echo "Tests for $FRAMEWORK are skipped (skipping build)"
  exit 0
fi

echo "Building e2e/$FRAMEWORK..."
cd "$APP_DIR"

# ci, not install, so a transitive release between two runs cannot change
# what is built, and a local run leaves the lockfile alone
npm ci
npm run build

# Add child pages from fixtures
rm -rf "$ROOT/e2e/fixtures/$FRAMEWORK/child"
cp -r "$ROOT/e2e/fixtures/child" "$ROOT/e2e/fixtures/$FRAMEWORK/child"

echo "Done"
