#!/bin/bash

# Build all e2e framework apps
# For CI, each framework is built individually via build-e2e-app.sh
# This script is for local use - builds all at once

ROOT=$(cd "$(dirname "$0")/.." && pwd)
FAILED=0

for dir in "$ROOT"/e2e/apps/*/; do
  name=$(basename "$dir")
  if ! bash "$ROOT/build-scripts/build-e2e-app.sh" "$name"; then
    echo "WARNING: $name build failed"
    FAILED=$((FAILED + 1))
  fi
done

if [ $FAILED -gt 0 ]; then
  echo "$FAILED framework(s) failed to build"
fi
