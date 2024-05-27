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

cd ../../js
rm -v ../iframe-resizer.zip
zip ../iframe-resizer.zip **
cd ..

cp -rv js js-dist 

git add .

git commit -am "Release $VERSION"
git tag "v$VERSION"
git push --tags
git push

