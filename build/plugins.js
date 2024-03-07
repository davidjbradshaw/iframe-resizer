import strip from '@rollup/plugin-strip'
import terser from '@rollup/plugin-terser'
import commonjs from '@rollup/plugin-commonjs';
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import stripCode from 'rollup-plugin-strip-code'
import versionInjector from 'rollup-plugin-version-injector'

import createBanner from './banner.js'
import createPkgJson from './pkgJson.js'

import pkg from '../package.json' with { type: "json" }

const vi = {
  injectInComments: false,
  logLevel: 'warn',
}

export const injectVersion = () => [versionInjector(vi)]

export const pluginsBase = (stripLog) => (file) => {
  const delog = [strip({ functions: ['log'] })]

  const base = [
    versionInjector(vi),
    commonjs(), 
    terser({
      output: {
        comments: false,
        preamble: createBanner(file),
      },
    }),
  ]

  return stripLog ? delog.concat(base) : base
}

const fixVersion = (file) => 
  file in {core:1, child:1} ? {} : { additionalDependencies: { '@iframe-resizer/core': pkg.version } }

export const pluginsProd = (file) => {
  const path = `dist/${file}`

  return [
    clear({ targets: [path] }),
    generatePackageJson({
      ...fixVersion(file),
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
