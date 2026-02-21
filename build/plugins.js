import commonjs from '@rollup/plugin-commonjs'
import strip from '@rollup/plugin-strip'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import stripCode from 'rollup-plugin-strip-code'
import versionInjector from 'rollup-plugin-version-injector'

import pkg from '../package.json' with { type: 'json' }
import createPkgJson from './pkgJson.js'

const vi = {
  injectInComments: false,
  logLevel: 'warn',
}

export const injectVersion = () => [versionInjector(vi)]

export const pluginsBase = (stripLog) => () => {
  const delog = [strip({ functions: ['log', 'debug'] })]
  const log = [strip({ functions: ['purge'] })]

  const base = [versionInjector(vi), commonjs()]

  return stripLog ? delog.concat(base) : log.concat(base)
}

const fixVersion = (file) => {
  switch (file) {
    case 'core':
    case 'child':
      return {}

    // return { additionalDependencies: { 'auto-console-group': pkg.dependencies['auto-console-group'] } }
    case 'legacy':
      return {
        additionalDependencies: {
          '@iframe-resizer/child': pkg.version,
          '@iframe-resizer/jquery': pkg.version,
          '@iframe-resizer/parent': pkg.version,
        },
      }

    default:
      return { additionalDependencies: { '@iframe-resizer/core': pkg.version } }
  }
}

const today = new Date().toISOString().split('T').join(' - ')

const createTransform = (file) => (contents) =>
  String(contents)
    .replace(/@@PKG_NAME@@/g, `@iframe-resizer/${file}`)
    .replace(/@@PKG_VERSION@@/g, pkg.version)
    .replace(/@@BUILD_DATE@@/g, today)

export const createPluginsProd = (stripLog) => (file) => {
  const dest = `dist/${file}`
  const src = `packages`

  const transform = createTransform(file)

  const targets = [
    { src: ['LICENSE' /* 'FUNDING.md',  'SECURITY.md' */], dest },
    { src: `${src}/TEMPLATE.md`, dest, rename: 'README.md', transform },
  ]

  return [
    clear({ targets: [dest] }),
    generatePackageJson({
      ...fixVersion(file),
      baseContents: createPkgJson(file),
      outputFolder: dest,
    }),
    copy({
      copyOnce: true,
      targets,
      verbose: true,
    }),
    stripCode({
      start_comment: 'TEST CODE START',
      end_comment: 'TEST CODE END',
    }),
    ...pluginsBase(stripLog)(),
  ]
}
