#! /bin/bash

INSTALL=false
BETA=false

for arg in "$@"; do
  case $arg in
    -i|--install) INSTALL=true ;;
    -b|--beta) BETA=true ;;
  esac
done

for dir in example/*/; do
  if [ -f "$dir/package.json" ]; then
    echo "=== Updating $dir ==="
    cd "$dir"
    ncu -u
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

echo "Done"
