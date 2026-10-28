#!/bin/bash
set -euo pipefail

# Build all e2e framework apps
# For CI, each framework is built individually via build-e2e-app.sh
# This script is for local use - builds all at once

ROOT=$(cd "$(dirname "$0")/.." && pwd)
FAILED=0
BUILT=0

# Without this the loop runs once on the unexpanded glob when there are no
# apps, and the script reports success having built nothing
shopt -s nullglob

for dir in "$ROOT"/e2e/apps/*/; do
  name=$(basename "$dir")
  BUILT=$((BUILT + 1))
  if ! bash "$ROOT/build-scripts/build-e2e-app.sh" "$name"; then
    echo "WARNING: $name build failed"
    FAILED=$((FAILED + 1))
  fi
done

if [ $BUILT -eq 0 ]; then
  echo "No e2e apps found in $ROOT/e2e/apps"
  exit 1
fi

# Builds every app first, so all the failures are listed, then fails
if [ $FAILED -gt 0 ]; then
  echo "$FAILED framework(s) failed to build"
  exit 1
fi
