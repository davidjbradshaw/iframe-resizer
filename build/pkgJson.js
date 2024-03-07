const browser = (file) =>
  file === 'react' ? {} : { browser: `iframe-resizer.${file}.js` }

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
    main: `iframe-resizer.${file}.cjs`,
    module: `iframe-resizer.${file}.mjs`,
    ...browser(file),
    keywords: [...keywords, file],
  })
