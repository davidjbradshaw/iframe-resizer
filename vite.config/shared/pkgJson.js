const main = 'index.cjs.js'
const module = 'index.esm.js'
const types = 'index.d.ts'

const customConfig = (file) => {
  const entryPoints = {
    main,
    module,
    types,
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
        exports: {
          '.': {
            types: `./${types}`,
            import: `./${module}`,
            require: './index.umd.js',
          },
          './sfc': {
            types: './iframe-resizer.vue.d.ts',
            default: './iframe-resizer.vue',
          },
          './package.json': './package.json',
        },
        peerDependencies: {
          vue: '^3.3.0',
        },
      }

    case 'svelte':
      return {
        main,
        module,
        types,
        svelte: 'IframeResizer.svelte',
        exports: {
          '.': {
            svelte: './IframeResizer.svelte',
            import: './index.esm.js',
            require: './index.cjs.js',
          },
        },
        peerDependencies: {
          svelte: '^4.0.0 || ^5.0.0',
        },
      }

    case 'solid':
      return {
        main,
        module,
        types,
        solid: 'IframeResizer.tsx',
        exports: {
          '.': {
            solid: './IframeResizer.tsx',
            import: './index.esm.js',
            require: './index.cjs.js',
          },
        },
        peerDependencies: {
          'solid-js': '^1.0.0',
        },
      }

    case 'alpine':
      return {
        main,
        module,
        types,
        peerDependencies: {
          alpinejs: '^3.0.0',
        },
      }

    case 'web-component':
      return {
        main,
        module,
        types,
      }

    case 'jquery':
      return {
        main,
        module,
        browser: 'index.umd.js',
      }

    case 'common':
      return {
        main,
        module,
        types,
        exports: {
          '.': { import: `./${module}`, require: `./${main}` },
          './consts': {
            import: './consts.esm.js',
            require: './consts.cjs.js',
          },
        },
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
