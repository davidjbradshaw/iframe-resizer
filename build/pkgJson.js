const main = (file) =>
  file === 'parent'
    ? {
        main: 'iframe-resizer.parent.cjs',
        module: 'iframe-resizer.parent.mjs',
        browser: 'iframe-resizer.parent.js',
      }
    : {
        main: `iframe-resizer.${file}.js`,
      }

export default (file) =>
  ({
    version,
    license,
    homepage,
    author,
    description,
    github,
    repository,
    funding,
    keywords,
  }) => ({
    name: `@iframe-resizer/${file}`,
    version,
    license,
    private: false,
    homepage,
    author,
    description,
    github,
    repository,
    funding,
    keywords: [...keywords, file],
    ...main(file),
  })
