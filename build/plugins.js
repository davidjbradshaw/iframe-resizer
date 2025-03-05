import strip from '@rollup/plugin-strip'
import commonjs from '@rollup/plugin-commonjs'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import stripCode from 'rollup-plugin-strip-code'
import versionInjector from 'rollup-plugin-version-injector'

import createPkgJson from './pkgJson.js'

import pkg from '../package.json' with { type: 'json' }

const vi = {
  injectInComments: false,
  logLevel: 'warn',
}

export const injectVersion = () => [versionInjector(vi)]

export const pluginsBase = (stripLog) => (file) => {
  const delog = [strip({ functions: ['log', 'debug'] })]

  const base = [versionInjector(vi), commonjs()]

  return stripLog ? delog.concat(base) : base
}

const fixVersion = (file) =>
  file in { core: 1, child: 1 }
    ? {}
    : file !== 'legacy'
      ? { additionalDependencies: { '@iframe-resizer/core': pkg.version } }
      : {
          additionalDependencies: {
            '@iframe-resizer/child': pkg.version,
            '@iframe-resizer/jquery': pkg.version,
            '@iframe-resizer/parent': pkg.version,
          },
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
    { src: `${src}/README.md`, dest, transform },
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
    ...pluginsBase(stripLog)(file),
  ]
}
