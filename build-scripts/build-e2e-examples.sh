#!/bin/bash
set -euo pipefail

# Build e2e framework apps into e2e/fixtures/
# These are self-contained apps in e2e/apps/ that use dist/ packages

ROOT=$(cd "$(dirname "$0")/.." && pwd)

for name in react vue; do
  echo "=== Building e2e/$name ==="
  cd "$ROOT/e2e/apps/$name"

  npm install
  npm run build

  # Add child pages from fixtures
  cp -r "$ROOT/e2e/fixtures/child" "$ROOT/e2e/fixtures/$name/child"

  cd "$ROOT"
done

echo "Done"
