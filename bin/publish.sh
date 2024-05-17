#! /bin/bash

VERSION=`node bin/getVersion.js  2>/dev/null`
echo
echo "Publishing version $VERSION"
echo

npm run build:prod
cd dist/parent
npm publish
cd ../child
npm publish
cd ../core
npm publish
cd ../jquery
npm publish
cd ../react
npm publish

git tag -a $VERSION -m "Release $VERSION"
git push
git push --tags

