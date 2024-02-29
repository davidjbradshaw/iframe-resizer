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

const BANNER = `
/**
 *  iframe-resizer v${parentPkg.version}
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

console.log('\nBuilding version', parentPkg.version)

export default [ 
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/iframeResizer.js',
    output: [
      {
        file: paths.parent + parentPkg.main, format: 'cjs',
        sourcemap: true,
      },
      {
        file: paths.parent + parentPkg.module, format: 'es',
        sourcemap: true,
      }
    ],
    plugins: [
      terser(),
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
    input: 'src/iframeResizer.js',
    output: {
      name: 'iframeResize',
      file: paths.parent + parentPkg.browser,
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      resolve(), 
      commonjs(),
      terser(),
    ],
  }, 
  
  // Content Window
  {
    input: 'src/iframeResizer.contentWindow.js',
    output: [{
      file: paths.content + 'index.min.js',
      sourcemap: true,
    }],
    plugins: [
      terser(),
      stripCode({
        start_comment: '// TEST CODE START //',
        end_comment: '// TEST CODE END //',
      })
    ],
  }, 

  {
    input: 'src/iframeResizer.js',
    output: [{ 
      file: 'js/iframeResizer.js',
      sourcemap: true,
    }],
    plugins: [
      terser({
      output: {
        preamble: BANNER,
        comments: false
      }
    }),
    ],
  }, 
  
  {
    input: 'src/iframeResizer.contentWindow.js',
    output: [{ 
      file: 'js/iframeResizer.contentWindow.js',
      sourcemap: true, 
    }],
    plugins: [
      terser({
      output: {
        preamble: BANNER,
        comments: false
      }
    }),
      stripCode({
        start_comment: '// TEST CODE START //',
        end_comment: '// TEST CODE END //',
      })
    ],
  },
]

