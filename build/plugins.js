import strip from '@rollup/plugin-strip'
import terser from '@rollup/plugin-terser'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import stripCode from 'rollup-plugin-strip-code'
import versionInjector from 'rollup-plugin-version-injector'

import BANNER from './banner.js'
import createPkgJson from './pkgJson.js'

const vi = {
  injectInComments: false,
  logLevel: 'warn',
}

export const injectVersion = () => [versionInjector(vi)]

export const pluginsBase = (stripLog) => (file) => {
  const delog = [strip({ functions: ['log'] })]

  const base = [
    versionInjector(vi),
    // terser({
    //   output: {
    //     comments: false,
    //     preamble: BANNER[file],
    //   },
    // }),
  ]

  return stripLog ? delog.concat(base) : base
}

export const pluginsProd = (file) => {
  const path = `dist/${file}`

  return [
    clear({ targets: [path] }),
    generatePackageJson({
      baseContents: createPkgJson(file),
      outputFolder: path,
    }),
    copy({
      targets: [{ src: 'LICENSE', dest: path }],
    }),
    stripCode({
      start_comment: '// TEST CODE START //',
      end_comment: '// TEST CODE END //',
    }),
    ...pluginsBase(true)(file),
  ]
}
