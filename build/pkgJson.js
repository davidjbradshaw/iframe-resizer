const isReact = (file) =>
  file === 'react'
    ? {
        peerDependencies: {
          react: '^16.8.0 || ^17.0.0 || ^18.0.0',
          'react-dom': '^16.8.0 || ^17.0.0 || ^18.0.0',
        },
        moain: 'iframe-resizer.react..cjs.js',
        module: 'iframe-resizer.react.esm.js',
        types: 'iframe-resizer.react.d.ts',
      }
    : {
        main: `iframe-resizer.${file}.cjs.js`,
        module: `iframe-resizer.${file}.esm.js`,
        browser: `iframe-resizer.${file}.umd.js`,
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
    ...isReact(file),
    keywords: [...keywords, file],
  })
