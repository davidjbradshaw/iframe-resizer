import { babel } from '@rollup/plugin-babel'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import filesize from 'rollup-plugin-filesize'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

import createBanner from './build/banner.js'
import { output, outputs } from './build/output.js'
import { pluginsBase, pluginsProd, injectVersion } from './build/plugins.js'

import pkg from './package.json' with { type: 'json' }

const { ROLLUP_WATCH, DEBUG, TEST } = process.env

const debugMode = DEBUG || ROLLUP_WATCH || false
const sourcemap = debugMode
const logging = debugMode || TEST

const outputPlugins = (file, format) => ({
  plugins: terser({
    output: {
      comments: false,
      preamble: createBanner(file, format),
    },
  }),
})

const filterDeps = (contents) => {
  const pkg = JSON.parse(contents)
  delete pkg.dependencies.react
  delete pkg.private
  return JSON.stringify(pkg, null, 2)
}

const pluginsJs = TEST ? injectVersion : pluginsBase(!logging)

console.log(
  '\nBuilding iframe-resizer version',
  pkg.version,
  debugMode ? 'DEVELOPMENT' : 'PRODUCTION',
  '\n',
)

const npm = [
  // Core
  {
    input: 'packages/core/index.js',
    output: [
      {
        name: 'createResizer',
        ...output('core')('umd'),
      },
      output('core')('esm'),
      output('core')('cjs'),
    ],
    plugins: pluginsProd('core'),
    watch: false,
  },

  //  Parent ES module (for bundlers) and CommonJS (for Node) build.
  {
    input: 'packages/parent/esm.js',
    output: [output('parent')('esm'), output('parent')('cjs')],
    external: ['@iframe-resizer/core'],
    plugins: pluginsProd('parent'),
    watch: false,
  },

  // Parent browser-friendly UMD build
  {
    input: 'packages/parent/umd.js',
    output: [
      {
        name: 'iframeResize',
        ...output('parent')('umd'),
      },
    ],
    plugins: [
      ...pluginsProd('parent'),
      resolve(),
      copy({
        targets: [
          {
            src: 'packages/parent/index.d.ts',
            dest: 'dist/parent/',
            rename: 'iframe-resizer.parent.d.ts',
          },
        ],
        verbose: true,
      }),
    ],
  },

  // Child
  {
    input: 'packages/child/index.js',
    output: outputs('child'),
    plugins: pluginsProd('child'),
    watch: false,
  },

  //  jQuery (ES)
  {
    input: 'packages/jquery/plugin.js',
    output: [output('jquery')('esm'), output('jquery')('cjs')],
    external: ['@iframe-resizer/core'],
    plugins: pluginsProd('parent'),
    watch: false,
  },

  // jQuery (umd)
  {
    input: 'packages/jquery/plugin.js',
    output: output('jquery')('umd'),
    plugins: [...pluginsProd('jquery'), resolve()],
  },

  // React
  {
    input: 'packages/react/index.jsx',
    output: [output('react')('esm'), output('react')('cjs')],
    external: [
      '@iframe-resizer/core',
      'prop-types',
      'react',
      'warning',
      /@babel\/runtime/,
    ],
    plugins: [
      ...pluginsProd('react'),
      copy({
        hook: 'closeBundle',
        targets: [
          {
            src: 'packages/react/index.d.ts',
            dest: 'dist/react/',
            rename: 'iframe-resizer.react.d.ts',
          },
          {
            src: 'dist/react/package.json',
            dest: 'dist/react/',
            transform: filterDeps,
          },
        ],
        verbose: true,
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
      }),
      filesize(),
    ],
    watch: false,
  },
]

// JS folder (iife)
const js = [
  {
    input: `packages/parent/iife.js`,
    output: [
      {
        banner: createBanner('parent', 'iife'),
        file: 'js/iframe-resizer.parent.js',
        format: 'iife',
        name: 'iframeResize',
        sourcemap,
        ...outputPlugins('parent', 'iife'),
      },
    ],
    plugins: [
      clear({ targets: ['js'] }),
      filesize(),
      ...pluginsJs('parent'),
      resolve(),
    ],
  },

  {
    input: 'packages/child/index.js',
    output: [
      {
        banner: createBanner('child', 'iife'),
        file: 'js/iframe-resizer.child.js',
        format: 'iife',
        sourcemap,
        ...outputPlugins('child', 'iife'),
      },
    ],
    plugins: [filesize(), ...pluginsJs('child')],
  },

  {
    input: 'packages/jquery/plugin.js',
    output: [
      {
        banner: createBanner('jquery', 'iife'),
        file: 'js/iframe-resizer.jquery.js',
        format: 'iife',
        sourcemap,
        ...outputPlugins('jquery', 'iife'),
      },
    ],
    plugins: [filesize(), ...pluginsJs('jquery'), resolve()],
  },

  // test js folder (umd)
  {
    input: 'packages/child/index.js',
    output: [
      {
        banner: createBanner('child', 'test-js'),
        file: 'test-js/iframe-resizer.child.js',
      },
    ],
    plugins: injectVersion(),
  },
]

export default debugMode ? js : npm.concat(js)
