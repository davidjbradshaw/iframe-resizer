#! /bin/bash

INSTALL=false
BETA=false
MINOR=false

for arg in "$@"; do
  case $arg in
    -i|--install) INSTALL=true ;;
    -b|--beta) BETA=true ;;
    -m|--minor) MINOR=true ;;
  esac
done

NCU_TARGET=""
if $MINOR; then
  NCU_TARGET="--target minor"
fi

for dir in example/*/; do
  if [ -f "$dir/package.json" ]; then
    echo "=== Updating $dir ==="
    cd "$dir"
    ncu -u $NCU_TARGET
    if $BETA; then
      for pkg in $(grep -o '"@iframe-resizer/[^"]*"' package.json | tr -d '"'); do
        npm i "${pkg}@beta"
      done
    elif $INSTALL; then
      npm i
    fi
    cd - > /dev/null
    echo
  fi
done

if $MINOR; then
  echo "Note: Only minor/patch versions were updated. Run without --minor to check for major upgrades."
fi

echo "Done"
