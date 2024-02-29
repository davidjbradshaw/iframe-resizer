import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import resolve from '@rollup/plugin-node-resolve'
import stripCode from "rollup-plugin-strip-code"
import terser from '@rollup/plugin-terser'

import parentPkg from './dist/parent/package.json' with { type: "json" }

const paths = {
  parent: 'dist/parent/',
  content: 'dist/content-window/',
  jQuery: 'dist/jquery/',
}

const createBanner =  (file) => `
/**
 *  iframe-resizer (${file}) v${parentPkg.version}
 *
 *  ${parentPkg.homepage}
 *
 *  License: ${parentPkg.license}
 *  Author: ${parentPkg.author}
 *
 *  Description: Keep same and cross domain iFrames sized to their content with
 *               support for window/content resizing, and multiple iFrames.
 *
 */

`

const terserOptions = (file) => ({
  output: {
    preamble: createBanner(file),
    comments: false
  }
})

console.log('\nBuilding version', parentPkg.version)

export default [ 
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/parent.js',
    output: [
      {
        file: paths.parent + parentPkg.main, format: 'cjs',
        sourcemap: false,
      },
      {
        file: paths.parent + parentPkg.module, format: 'es',
        sourcemap: false,
      }
    ],
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
    input: 'src/umd.js',
    output: {
      name: 'iframeResize',
      file: paths.parent + parentPkg.browser,
      format: 'umd',
      sourcemap: false,
    },
    plugins: [
      resolve(), 
      commonjs(),
      terser(terserOptions('parent')),
    ],
  }, 
  
  // Content Window
  {
    input: 'src/child.js',
    output: [{
      file: paths.content + 'index.min.js',
      sourcemap: false,
    }],
    plugins: [
      terser(terserOptions('child')),
      stripCode({
        start_comment: '// TEST CODE START //',
        end_comment: '// TEST CODE END //',
      })
    ],
  }, 


  // JS folder
  {
    input: 'src/umd.js',
    output: [{
      name: 'iframeResize',
      file: 'js/iframeResizer.parent.js',
      format: 'umd',
      banner: createBanner('parent'),
      sourcemap: false,
    }],
    plugins: [
      // terser(terserOptions('parent')),
    ],
  }, 
  
  {
    input: 'src/jquery.js',
    output: [{
      name: 'iframeResize',
      file: 'js/jquery.iframeResizer.parent.js',
      format: 'umd',
      banner: createBanner('jquery.parent'),
      sourcemap: false,
    }],
    plugins: [
      // terser(terserOptions('jquery.parent')),
    ],
  }, 
  
  {
    input: 'src/child.js',
    output: [{ 
      file: 'js/iframeResizer.child.js',
      sourcemap: false, 
    }],
    plugins: [
      terser(terserOptions('child')),
      stripCode({
        start_comment: '// TEST CODE START //',
        end_comment: '// TEST CODE END //',
      })
    ],
  },
]

