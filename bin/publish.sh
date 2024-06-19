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
cd ../vue
npm publish

cd ../..
rm -v iframe-resizer.zip
zip iframe-resizer.zip js/**

cp -v js/** js-dist 

git add .

git commit -am "Release v$VERSION"
git tag "v$VERSION"
git pull
git push
git push --tags

cp -v js/* ../docs/public/js
