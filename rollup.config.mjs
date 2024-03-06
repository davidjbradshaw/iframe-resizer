import { babel } from '@rollup/plugin-babel'
import clear from 'rollup-plugin-clear'
import filesize from 'rollup-plugin-filesize'
import resolve from '@rollup/plugin-node-resolve';

import BANNER from './build/banner.js'
import { output, outputs } from './build/output.js'
import { pluginsBase, pluginsProd, injectVersion } from './build/plugins.js'

import pkg from './package.json' with { type: "json" }

const { ROLLUP_WATCH, DEBUG, TEST } = process.env

const debugMode = DEBUG || ROLLUP_WATCH || false
const sourcemap = debugMode
const logging = debugMode || TEST

const pluginsJs = TEST 
  ? injectVersion
  : pluginsBase(!logging)

console.log('\nBuilding iframe-resizer version', pkg.version, debugMode ? 'DEVELOPMENT' : 'PRODUCTION', '\n')

const npm = [
  // Core
  {
    input: 'src/core/index.js',
    output: [
      {
        name: 'createResizer',
        ...output('core')('umd')
      },
      output('core')('es'), 
      output('core')('cjs')
    ],
    plugins: pluginsProd('core'),
  }, 

  //  Parent ES module (for bundlers) and CommonJS (for Node) build.
  {
    input: 'src/parent/esm.js',
    output: [
      output('parent')('es'), 
      output('parent')('cjs')
    ],
    external: ['@iframe-resizer/core'],
    plugins: pluginsProd('parent'),
  },
  
  // Parent browser-friendly UMD build
  {
    input: 'src/parent/umd.js',
    output: [{
      name: 'iframeResize',
      ...output('parent')('umd'),
    }],
    plugins:[
      ...pluginsProd('parent'),
      resolve(),
    ]
  }, 

  // Child
  {
    input: 'src/child/index.js',
    output: outputs('child'),
    plugins: pluginsProd('child'),
  },

  //  jQuery (ES) 
  {
    input: 'src/jquery/plugin.js',
    output: [
      output('jquery')('es'), 
      output('jquery')('cjs')
    ],
    external: ['@iframe-resizer/core'],
    plugins: pluginsProd('parent'),
  },

  // jQuery (umd)
  {
    input: 'src/jquery/plugin.js',
    output: output('jquery')('umd'),
    plugins: [
      ...pluginsProd('jquery'),
      resolve()
    ],
  },

  // React
  {
    input: 'src/react/index.jsx',
    output: [
      output('react')('es'), 
      output('react')('cjs')
    ],
    external: ['@iframe-resizer/core', 'react', 'prop-types', 'warning'],
    plugins: [
      ...pluginsProd('react'),
      babel({
        exclude: 'node_modules/**',
      }),
    ]
  }, 
]

// JS folder
const js = [ 
  {
    input: `src/parent/iife.js`,
    output: [{
      banner: BANNER.parent,
      file: 'js/iframe-resizer.parent.js',
      format: 'iife' ,
      name: 'iframeResize',
      sourcemap,
    }],
    plugins: [
      clear({ targets: ['js']}),
      filesize(),
      ...pluginsJs('parent'),,
      resolve(),
    ],
  }, 

  {
    input: 'src/child/index.js',
    output: [{ 
      banner: BANNER.child,
      file: 'js/iframe-resizer.child.js',
      format: TEST ? 'iife': 'umd',
      sourcemap,
    }],
    plugins: [
      filesize(),
      ...pluginsJs('child'),
    ],
  }, 

  {
    input: 'src/jquery/plugin.js',
    output: [{
      banner: BANNER.jquery,
      file: 'js/iframe-resizer.parent.jquery.js',
      format: 'iife',
      sourcemap,
    }],
    plugins: [
      filesize(),
      ...pluginsJs('jquery'),
      resolve(),
    ],
  }, 
]

export default debugMode ? js : npm.concat(js)
