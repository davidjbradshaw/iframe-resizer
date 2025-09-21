const main = 'index.cjs.js'
const module = 'index.esm.js'

const customConfig = (file) => {
  const entryPoints = {
    main,
    module,
    browser: `index.umd.js`,
  }

  switch (file) {
    case 'react':
      return {
        main,
        module,
        types: `iframe-resizer.${file}.d.ts`,
        peerDependencies: {
          react: '^16.8.0 || ^17.0.0 || ^18.0.0  || ^19.0.0',
          'react-dom': '^16.8.0 || ^17.0.0 || ^18.0.0  || ^19.0.0',
        },
      }

    case 'legacy':
      return {
        name: 'iframe-resizer',
        main,
        module,
      }

    case 'vue':
      return {
        main: 'index.umd.js',
        types: 'index.d.ts',
        module,
        browser: {
          './sfc': 'iframe-resizer.vue',
        },
        peerDependencies: {
          vue: '^3.0.0',
        },
      }

    case 'parent':
    case 'child':
      return {
        ...entryPoints,
        types: `iframe-resizer.${file}.d.ts`,
      }

    case 'core':
      return {
        ...entryPoints,
        types: `index.d.ts`,
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
