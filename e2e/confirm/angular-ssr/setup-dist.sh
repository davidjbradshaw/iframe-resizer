#!/bin/bash
# npm's file: links to dist/ resolve to the real path, where no node_modules exist,
# so copy the dist packages in and mark them as ESM (what a bundler would pick via "module").
set -euo pipefail
cd "$(dirname "$0")"
for p in angular common core; do
  rm -rf node_modules/@iframe-resizer/$p
  cp -R ../../../dist/$p node_modules/@iframe-resizer/$p
  node -e '
const fs=require("fs"),f="node_modules/@iframe-resizer/'$p'/package.json";const j=JSON.parse(fs.readFileSync(f));
j.type="module"; j.main="index.esm.js"; if(!j.exports) j.exports={".":{types:"./index.d.ts",default:"./index.esm.js"}};
fs.writeFileSync(f,JSON.stringify(j,null,2))'
done
