#! /bin/bash

VERSION=`node bin/getVersion.js  2>/dev/null`

if [ -z "$1" ]; then
    echo "Build type not specified"
    echo
    exit 1
fi

if [[ $VERSION = *"-"* ]] && [ $1 = "prod" ]; then
    echo "Cannot publish a beta version as prod"
    echo
    exit 1
fi

echo
echo "Publishing version $VERSION"
echo

npm run build:$1

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

if [ $1 = "beta" ] 
then
  exit 0
fi

echo "Updating GitHub build"

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

echo "Updating iframe-resizer.com"
cp -v js/* ../docs/public/js
