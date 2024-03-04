import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import filesize from 'rollup-plugin-filesize'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import strip from '@rollup/plugin-strip'
import stripCode from "rollup-plugin-strip-code"
import terser from '@rollup/plugin-terser'
import versionInjector from 'rollup-plugin-version-injector';

import BANNER from './build/banner.js'
import createPkgJson from './build/pkg.js'

import pkg from './package.json' with { type: "json" }

const { ROLLUP_WATCH, DEBUG, TEST } = process.env

const debugMode = DEBUG || ROLLUP_WATCH
const sourcemap = debugMode
const logging = debugMode || TEST

const paths = {
  parent: 'dist/parent/',
  child: 'dist/child/',
  jQuery: 'dist/jquery/',
}

const vi = {
  injectInComments: false,
  logLevel: 'warn',
}

const plugins = (file) => {
  // if (TEST) return [versionInjector(vi)]

  const base =[
    versionInjector(vi),
    terser({
      output: {
        comments: false,
        preamble: BANNER[file],
      }
    }),
  ]

  const prod = [
    generatePackageJson({
      baseContents: createPkgJson(file.toLowerCase()),
      outputFolder: 'dist/' + file,
    }),
    strip({ functions: ['log'] }),
    stripCode({
      start_comment: '// TEST CODE START //',
      end_comment: '// TEST CODE END //',
    }),
  ]

  return logging ? base : prod.concat(base)
}

console.log('\nBuilding iframe-resizer version', pkg.version, debugMode ? 'DEVELOPMENT' : 'PRODUCTION', '\n')

const npm = [
  //  ES module (for bundlers) and CommonJS (for Node) build.
  {
    input: 'src/parent/esm.js',
    output: [{
        file: paths.parent + 'iframe-resizer.parent.mjs',
        format: 'es',
        sourcemap,
      }, {
        file: paths.parent + 'iframe-resizer.parent.cjs',
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
      file: paths.parent + 'iframe-resizer.parent.js',
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
      file: paths.child + 'iframe-resizer.child.js',
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
    input: 'src/jquery/plugin.js',
    output: [{
      file: paths.jQuery + 'iframe-resizer.jquery.js',
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
      file: 'js/iframe-resizer.parent.js',
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
      file: 'js/iframe-resizer.child.js',
      format: TEST ? undefined : 'umd',
      banner: BANNER.child,
      sourcemap,
    }],
    plugins: [
      ...plugins('child'),
      filesize(),
    ],
  }, 

  {
    input: 'src/jquery/plugin.js',
    output: [{
      file: 'js/iframe-resizer.parent.jquery.js',
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

export default debugMode || TEST ? js : npm.concat(js)
