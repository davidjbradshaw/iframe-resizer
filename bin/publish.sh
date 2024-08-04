#! /bin/bash

VERSION=`node bin/getVersion.js  2>/dev/null`

if [ -z "$1" ]; then
    echo "Build type not specified"
    echo
    exit 1
fi

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

npm run build:$1

cd dist/parent
npm publish --tag $1
cd ../child
npm publish --tag $1 
cd ../core
npm publish --tag $1
cd ../jquery
npm publish --tag $1
cd ../react
npm publish --tag $1
cd ../vue
npm publish --tag $1
cd ../legacy
npm publish --tag $1

if [ $1 != "latest" ] 
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
