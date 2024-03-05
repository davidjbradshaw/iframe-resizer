import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import strip from '@rollup/plugin-strip'
import stripCode from "rollup-plugin-strip-code"
import terser from '@rollup/plugin-terser'
import versionInjector from 'rollup-plugin-version-injector';

import BANNER from './banner.js'
import createPkgJson from './pkg.js'

const vi = {
  injectInComments: false,
  logLevel: 'warn',
}
  
export const pluginsBase = (file) => [
    versionInjector(vi),
    terser({
      output: {
        comments: false,
        preamble: BANNER[file],
      }
    }),
  ]

export const pluginsProd = (file) => {
  const path = 'dist/' + file
  
  return [
    clear({ targets: [path]}),
    generatePackageJson({
      baseContents: createPkgJson(file),
      outputFolder: path,
    }),
    copy({
      targets: [
        { src: 'LICENSE', dest: path},
      ]
    }),
    strip({ functions: ['log'] }),
    stripCode({
      start_comment: '// TEST CODE START //',
      end_comment: '// TEST CODE END //',
    }),
  ].concat(pluginsBase(file))
}
