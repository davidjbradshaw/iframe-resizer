import { babel } from '@rollup/plugin-babel'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import filesize from 'rollup-plugin-filesize'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import vue from '@vitejs/plugin-vue'

import createBanner from './build/banner.js'
import { output, outputs } from './build/output.js'
import {
  pluginsBase,
  createPluginsProd,
  injectVersion,
} from './build/plugins.js'

// eslint-disable-next-line import/no-unresolved
import pkg from './package.json' with { type: 'json' }
import typescript from '@rollup/plugin-typescript'

const { BETA, ROLLUP_WATCH, DEBUG, TEST } = process.env

const debugMode = DEBUG || ROLLUP_WATCH || false
const betaMode = BETA || false
const sourcemap = debugMode || betaMode || false
const logging = debugMode || betaMode || TEST

const outputPlugins = debugMode
  ? () => ({})
  : (file, format) => ({
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
  delete pkg.dependencies['@angular/core']
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
        globals: {
          'auto-console-group': 'acg',
        },
        ...output('core')('umd'),
      },
      output('core')('esm'),
      output('core')('cjs'),
    ],
    external: ['auto-console-group'],
    plugins: [
      pluginsProd('core'),
      filesize(),
    ],
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

  //  Parent ES module (for bundlers) and CommonJS (for Node) build.
  {
    input: 'packages/parent/esm.js',
    output: [output('parent')('esm'), output('parent')('cjs')],
    external: ['@iframe-resizer/core', 'auto-console-group'],
    plugins: pluginsProd('parent'),
    watch: false,
  },

  // Child UMD
  {
    input: 'packages/child/index.js',
    output: output('child')('umd'),
    plugins: [
      ...pluginsProd('child'),
      resolve(),
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

  //Child ES module (for bundlers) and CommonJS (for Node) build.
  {
    input: 'packages/child/index.js',
    output: [output('child')('esm'), output('child')('cjs')],
    external: ['auto-console-group'],
    plugins: [
      filesize(),
      pluginsProd('child'),
    ],
    watch: false,
  },

  //  jQuery (ES)
  {
    input: 'packages/jquery/plugin.js',
    output: [output('jquery')('esm'), output('jquery')('cjs')],
    external: ['@iframe-resizer/core', 'auto-console-group'],
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
      resolve(),
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
    input: 'packages/react/index.tsx',
    output: [output('react')('esm'), output('react')('cjs')],
    external: [
      '@iframe-resizer/core',
      'auto-console-group',
      'react',
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/react',
        include: ['packages/react/**/*.ts', 'packages/react/**/*.tsx'],
      }),
      ...pluginsProd('react'),
      copy({
        hook: 'closeBundle',
        targets: [
          {
            src: 'dist/react/package.json',
            dest: 'dist/react/',
            transform: filterDeps,
          },
        ],
        verbose: true,
      }),
      filesize(),
    ],
    watch: false,
  },

  // Vue
  {
    input: 'packages/vue/index.ts',
    output: [
      {
        globals: {
          'auto-console-group': 'acg',
          '@iframe-resizer/core': 'connectResizer',
          vue: 'Vue',
        },
        name: 'IframeResizer',
        ...output('vue')('umd'),
      },
      output('vue')('cjs'),
      output('vue')('esm'),
    ],
    external: ['@iframe-resizer/core', 'vue', 'auto-console-group'],
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('iframe-resizer')
          }
        }
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/vue',
        include: ['packages/vue/**/*.ts'],
        exclude: ['packages/vue/**/*.vue'],
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
          {
            src: 'packages/vue/iframe-resizer.vue.d.ts',
            dest: 'dist/vue/',
          },
          {
            src: 'dist/vue/vue/index.d.ts',
            dest: 'dist/vue/',
          },
        ],
        verbose: true,
      }),
      filesize(),
    ],
    watch: false,
  },

  // Angular
  {
    input: 'packages/angular/directive.ts',
    output: [output('angular')('esm'), output('angular')('cjs')],
    external: ['@iframe-resizer/core', 'auto-console-group', '@angular/core'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/angular',
      }),
      ...pluginsProd('angular'),
      copy({
        hook: 'closeBundle',
        targets: [
          {
            src: 'dist/angular/package.json',
            dest: 'dist/angular/',
            transform: filterDeps,
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
    plugins: [filesize(), resolve(), ...pluginsJs('child')],
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
    plugins: [filesize(), resolve(), ...pluginsJs('jquery')],
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
    plugins: [injectVersion(), resolve()],
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
