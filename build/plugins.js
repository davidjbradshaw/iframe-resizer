import strip from '@rollup/plugin-strip'
import commonjs from '@rollup/plugin-commonjs';
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import stripCode from 'rollup-plugin-strip-code'
import versionInjector from 'rollup-plugin-version-injector'

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
  ]

  return stripLog ? delog.concat(base) : base
}

const fixVersion = (file) => 
  file in {core:1, child:1} ? {} : { additionalDependencies: { '@iframe-resizer/core': pkg.version } }

const today = new Date().toISOString().split('T').join(' - ')

const createTransform = (file) => (contents) =>
  String(contents)
    .replace(/__PKG_NAME__/g, `@iframe-resizer/${file}`)
    .replace(/__PKG_VERSION__/g, pkg.version)
    .replace(/__BUILD_DATE__/g, today)

export const pluginsProd = (file) => {
  const dest = `dist/${file}`
  const src = `packages`

  const transform = createTransform(file)

  return [
    clear({ targets: [dest] }),
    generatePackageJson({
      ...fixVersion(file),
      baseContents: createPkgJson(file),
      outputFolder: dest,
    }),
    copy({
      copyOnce: true,
      targets: [
        { src: ['LICENSE', 'FUNDING.md', 'SECURITY.md'], dest},
        { src: `${src}/README.md`, dest, transform }
      ],
      verbose: true,
    }),
    stripCode({
      start_comment: '// TEST CODE START //',
      end_comment: '// TEST CODE END //',
    }),
    ...pluginsBase(true)(file),
  ]
}
