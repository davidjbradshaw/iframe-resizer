import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import filesize from 'rollup-plugin-filesize'
import strip from '@rollup/plugin-strip'
import stripCode from "rollup-plugin-strip-code"
import terser from '@rollup/plugin-terser'
import versionInjector from 'rollup-plugin-version-injector';

import BANNER from './build/banner.js'

import parentPkg from './dist/parent/package.json' with { type: "json" }

const { ROLLUP_WATCH, DEBUG } = process.env

const debugMode = DEBUG || ROLLUP_WATCH
const sourcemap = debugMode
const logging = debugMode

const paths = {
  parent: 'dist/parent/',
  child: 'dist/child/',
  jQuery: 'dist/jquery/',
}

const plugins = (file) => {
  const base =[
    versionInjector(),
    terser({
      output: {
        comments: false,
        preamble: BANNER[file],
      }
    }),
  ]

  const prod = [
    strip({ functions: ['log'] }),
    stripCode({
      start_comment: '// TEST CODE START //',
      end_comment: '// TEST CODE END //',
    }),
  ]

  return logging ? base.concat(prod) : base
}

console.log('\nBuilding iframe-resizer version', parentPkg.version, debugMode ? 'DEVELOPMENT' : 'PRODUCTION', '\n')

const npm = [
  //  ES module (for bundlers) and CommonJS (for Node) build.
  {
    input: 'src/parent/esm.js',
    output: [{
        file: paths.parent + parentPkg.module,
        format: 'es',
        sourcemap,
      }, {
        file: paths.parent + parentPkg.main,
        format: 'cjs',
        sourcemap,
      }],
    plugins: [
      ...plugins('parent'),
      copy({
        targets: [
          { 
            src: 'LICENSE', 
            dest: Object.values(paths)
          },
        ]
      })
    ],
  },

  // browser-friendly UMD build
  {
    input: 'src/parent/umd.js',
    output: [{
      name: 'iframeResize',
      file: paths.parent + parentPkg.browser,
      format: 'umd',
      sourcemap,
    }],
    plugins: [
      ...plugins('parent'),
      filesize(),
    ],
  }, 
  
  // child
  {
    input: 'src/child/main.js',
    output: [{
      file: paths.child + 'index.min.js',
      format: 'umd',
      banner: BANNER.child,
      sourcemap,
    }],
    plugins: [
      ...plugins('child'),
      filesize(),
    ],
  }, 

  // jQuery
  {
    input: 'src/jquery.js',
    output: [{
      file: paths.jQuery + 'index.min.js',
      format: 'umd',
      banner: BANNER.jQuery,
      sourcemap,
    }],
    plugins: [
      ...plugins('jQuery'),
      filesize(),
    ],
  }, 
]

// JS folder
const js = [ 
  {
    input: 'src/parent/umd.js',
    output: [{
      name: 'iframeResize',
      file: 'js/iframeResizer.parent.js',
      format: 'umd',
      banner: BANNER.parent,
      sourcemap,
    }],
    plugins: [
      clear({ targets: ['js']}),
      ...plugins('parent'),
      filesize(),
    ],
  }, 

  {
    input: 'src/child/main.js',
    output: [{ 
      file: 'js/iframeResizer.child.js',
      format: 'umd',
      banner: BANNER.child,
      sourcemap,
    }],
    plugins: [
      ...plugins('child'),
      filesize(),
    ],
  }, 

  {
    input: 'src/jquery.js',
    output: [{
      file: 'js/jquery.iframeResizer.parent.js',
      format: 'umd',
      banner: BANNER.jQuery,
      sourcemap,
    }],
    plugins: [
      ...plugins('jQuery'),
      filesize(),
    ],
  }, 
]

export default debugMode ? js : npm
