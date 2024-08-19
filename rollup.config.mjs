import { babel } from '@rollup/plugin-babel'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import filesize from 'rollup-plugin-filesize'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import vue from 'rollup-plugin-vue'

import createBanner from './build/banner.js'
import { output, outputs } from './build/output.js'
import {
  pluginsBase,
  createPluginsProd,
  injectVersion,
} from './build/plugins.js'

import pkg from './package.json' with { type: 'json' }
import typescript from '@rollup/plugin-typescript'

const { BETA, ROLLUP_WATCH, DEBUG, TEST } = process.env

const debugMode = DEBUG || ROLLUP_WATCH || false
const betaMode = BETA || false
const sourcemap = debugMode || betaMode || false
const logging = debugMode || betaMode || TEST

const outputPlugins = debugMode ? () => { } : (file, format) => ({
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
  delete pkg.dependencies.vue
  delete pkg.private
  return JSON.stringify(pkg, null, 2)
}

const pluginsJs = TEST ? injectVersion : pluginsBase(!logging)
const pluginsProd = createPluginsProd(!logging)

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
    plugins: [
      ...pluginsProd('child'),
      copy({
        targets: [
          {
            src: 'packages/child/index.d.ts',
            dest: 'dist/child/',
            rename: 'iframe-resizer.child.d.ts',
          },
        ],
        verbose: true,
      }),
    ],
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

  //  legacy (ES)
  {
    input: 'packages/legacy/index.esm.js',
    output: [output('legacy')('esm'), output('legacy')('cjs')],
    external: [
      '@iframe-resizer/parent',
      '@iframe-resizer/child',
      '@iframe-resizer/jquery',
      '@iframe-resizer/core',
    ],
    plugins: pluginsProd('legacy'),
  },

  // legacy parent (umd)
  {
    input: `packages/legacy/js/iframeResizer.js`,
    output: [
      {
        name: 'iframeResize',
        ...output('legacy (parent)')('umd'),
        file: 'dist/legacy/js/iframeResizer.js',
      },
      {
        name: 'iframeResize',
        ...output('legacy (parent)')('umd'),
        file: 'dist/legacy/js/iframeResizer.min.js',
      },
    ],
    plugins: [pluginsProd('legacy'), resolve()],
  },

  // legacy child(iife)
  {
    input: 'packages/legacy/js/iframeResizer.contentWindow.js',
    output: [
      {
        banner: createBanner('legacy child', 'iife'),
        file: 'dist/legacy/js/iframeResizer.contentWindow.js',
        format: 'iife',
        sourcemap,
        ...outputPlugins('legacy (child)', 'iife'),
      },
      {
        banner: createBanner('legacy child', 'iife'),
        file: 'dist/legacy/js/iframeResizer.contentWindow.min.js',
        format: 'iife',
        sourcemap,
        ...outputPlugins('legacy (child)', 'iife'),
      },
    ],
    plugins: [
      pluginsProd('legacy'),
      copy({
        hook: 'closeBundle',
        targets: [
          {
            src: 'packages/legacy/README.md',
            dest: 'dist/legacy/',
          },
        ],
        verbose: true,
      }),
    ],
  },

  // React
  {
    input: 'packages/react/index.jsx',
    output: [output('react')('esm'), output('react')('cjs')],
    external: ['@iframe-resizer/core', 'react', 'warning', /@babel\/runtime/],
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

  // Vue
  {
    input: 'packages/vue/index.js',
    output: [
      {
        name: 'IframeResizer',
        ...output('vue')('umd'),
      },
      output('vue')('esm'),
      output('vue')('cjs'),
    ],
    external: ['@iframe-resizer/core', 'vue'],
    plugins: [
      typescript(),
      vue({
        css: true,
        compileTemplate: true,
      }),
      ...pluginsProd('vue'),
      copy({
        hook: 'closeBundle',
        targets: [
          {
            src: 'dist/vue/package.json',
            dest: 'dist/vue/',
            transform: filterDeps,
          },
          {
            src: 'dist/vue/*.js',
            dest: 'dist/vue/',
            transform: (contents, filename) =>
              contents.toString().replace('packages/vue', '.'),
          },
          {
            src: 'packages/vue/iframe-resizer.vue',
            dest: 'dist/vue/',
          },
        ],
        verbose: true,
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
  {
    input: 'packages/parent/umd.js',
    output: [
      {
        banner: createBanner('parent', 'test-js'),
        file: 'test-js/iframe-resizer.parent.js',
        format: 'umd',
        name: 'iframeResize',
      },
    ],
    plugins: [injectVersion(), resolve()],
  },
  {
    input: 'packages/jquery/plugin.js',
    output: [
      {
        banner: createBanner('jquery', 'test-js'),
        file: 'test-js/iframe-resizer.jquery.js',
        format: 'umd',
      },
    ],
    plugins: [injectVersion(), resolve()],
  },
]

export default debugMode ? js : npm.concat(js)
