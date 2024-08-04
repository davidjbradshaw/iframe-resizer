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
        description:
          "This project has now been split into two separate packages. Please use '@iframe-resizer/parent' and '@iframe-resizer/child'. See https://iframe-resizer.com/upgrade for more details.",
        main,
        module,
      }

    case 'vue':
      return {
        main: 'index.umd.js',
        module,
        browser: {
          './sfc': 'iframe-resizer.vue',
        },
        peerDependencies: {
          vue: '^2.6.0 || ^3.0.0',
        },
      }

    case 'parent':
    case 'child':
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
