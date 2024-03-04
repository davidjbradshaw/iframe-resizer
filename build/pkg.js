const main = (file) =>
  file === 'parent' ? {
    main: "iframe-resizer.parent.cjs",
    module: "iframe-resizer.parent.mjs",
    browser: "iframe-resizer.parent.js",
  } : {
    main: `iframer-resizer.${file}.js`,
  }

export default (file) => (pkg) => ({
name: "@iframe-resizer/" + file,
version: pkg.version,
license: pkg.license,
private: false,
homepage: pkg.homepage,
author: pkg.author,
description: pkg.description,
github: pkg.github,
repository: pkg.repository,
funding: pkg.funding,
keywords: pkg.keywords,
...main(file),
// "files": ["."]
})
