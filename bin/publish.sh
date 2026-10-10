#! /bin/bash

# Stop at the first failed step, so a failed test, build or publish
# never goes on to publish, tag or push
set -euo pipefail

YEAR=`date +%y`

PACKAGES=(
  common
  core
  alpine
  angular
  astro
  child
  jquery
  parent
  react
  solid
  svelte
  vue
  web-component
)

if [ -z "${1:-}" ]; then
    echo "Build type not specified"
    echo
    exit 1
fi

STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  git stash
  STASHED=true
fi
if ! git pull; then
  if $STASHED; then
    git stash pop
  fi
  exit 1
fi
if $STASHED; then
  git stash pop
fi

# Read after the pull, so the checks and the tag use the pulled version
VERSION=`node bin/getVersion.js  2>/dev/null`

if [[ $VERSION = *"-"* ]];then
  if [ $1 = "latest" ]; then
    echo "Cannot publish a beta version as latest"
    echo
    exit 1
  fi
else
  if [ $1 != "latest" ]; then
    echo "Cannot publish a non-beta version as $1"
    echo
    exit 1
  fi
fi

echo
echo "Publishing version $VERSION as $1"
echo

npm whoami &>/dev/null || npm login

# The latest tag gets the production build
BUILD=$1
if [ $1 = "latest" ]; then
  BUILD=prod
fi

npm install
npm test
npm run build:$BUILD

for pkg in "${PACKAGES[@]}"; do
  echo "Publishing @iframe-resizer/$pkg"
  (cd "dist/$pkg" && npm publish --tag $1 --access public)
done

if [ $1 != "latest" ]
then
  exit 0
fi

echo "Updating examples to v$VERSION"
node build-scripts/update-example-versions.js

echo "Updating example dependencies"
bin/update-examples.sh --minor

echo "Updating GitHub build"
rm -fv iframe-resizer.zip
zip iframe-resizer.zip js/**

cp -v js/** js-dist

git add .
git commit -am "Release v$VERSION"
git tag "v$VERSION"
git push
git push --tags

echo "Updating iframe-resizer.com"
cp -v js/* ../docs/public/js
echo "export default '$VERSION'" > ../docs/src/components/version.js
echo "export default '$YEAR'" > ../docs/src/components/year.js
