import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import resolve from '@rollup/plugin-node-resolve'
import stripCode from "rollup-plugin-strip-code"
import terser from '@rollup/plugin-terser'

import BANNER from './build/banner.js'

import parentPkg from './dist/parent/package.json' with { type: "json" }

const paths = {
  parent: 'dist/parent/',
  content: 'dist/child/',
  jQuery: 'dist/jquery/',
}

const sourcemap = true

const terserOptions = (file) => ({
  output: {
    preamble: BANNER[file],
    comments: false
  }
})

console.log('\nBuilding iframe-resizer version', parentPkg.version)

export default [ 
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
      terser(terserOptions('parent')),
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
    },{
      name: 'iframeResize',
      file: 'js/iframeResizer.parent.js',
      format: 'umd',
      banner: BANNER.parent,
      sourcemap,
    }],
    plugins: [
      resolve(), 
      commonjs(),
      terser(terserOptions('parent')),
    ],
  }, 
  
  // child
  {
    input: 'src/child/main.js',
    output: [{
      file: paths.content + 'index.min.js',
      format: 'umd',
      banner: BANNER.child,
      sourcemap,
    },{ 
      file: 'js/iframeResizer.child.js',
      format: 'umd',
      banner: BANNER.child,
      sourcemap: true, 
    }],
    plugins: [
      terser(terserOptions('child')),
      stripCode({
        start_comment: '// TEST CODE START //',
        end_comment: '// TEST CODE END //',
      })
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
    },{
      file: 'js/jquery.iframeResizer.parent.js',
      format: 'umd',
      banner: BANNER.jQuery,
      sourcemap,
    }],
    plugins: [
      terser(terserOptions('jQuery')),
    ],
  }, 
]

