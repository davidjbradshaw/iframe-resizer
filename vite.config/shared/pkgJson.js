const main = 'index.cjs.js'
const module = 'index.esm.js'
const types = 'index.d.ts'

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
        types,
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

    case 'angular':
      return {
        main,
        module,
        types: 'directive.d.ts',
        peerDependencies: {
          '@angular/core':
            '^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^20.0.0 || ^21.0.0',
        },
      }

    case 'astro':
      return {
        main: 'IframeResizer.astro',
        module: 'IframeResizer.astro',
        types,
        exports: {
          '.': './IframeResizer.astro',
          './types': { types: './index.d.ts' },
        },
        peerDependencies: {
          astro: '>=3.0.0',
        },
      }

    case 'vue':
      return {
        main: 'index.umd.js',
        module,
        types,
        browser: {
          './sfc': 'iframe-resizer.vue',
        },
        peerDependencies: {
          vue: '^2.6.0 || ^3.0.0',
        },
      }

    case 'core':
      return {
        ...entryPoints,
        types,
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
