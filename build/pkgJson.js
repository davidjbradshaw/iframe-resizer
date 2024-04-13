const customConfig = (file) => {
  const entryPoints = {
    main: `index.cjs.js`,
    module: `index.esm.js`,
    browser: `index.umd.js`,
  }

  switch (file) {
    case 'react':
      return {
        peerDependencies: {
          react: '^16.8.0 || ^17.0.0 || ^18.0.0',
          'react-dom': '^16.8.0 || ^17.0.0 || ^18.0.0',
        },
        main: 'index.cjs.js',
        module: 'index.esm.js',
        types: `iframe-resizer.${file}.d.ts`,
      }

    case 'parent':
      return {
        ...entryPoints,
        types: `iframe-resizer.${file}.d.ts`,
      }

    default:
      return entryPoints
  }
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
    homepage,
    author,
    description,
    github,
    repository,
    funding,
    ...customConfig(file),
    keywords: [...keywords, file],
  })
