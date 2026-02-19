import commonjs from '@rollup/plugin-commonjs'
import strip from '@rollup/plugin-strip'
import typescript from '@rollup/plugin-typescript'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import stripCode from 'rollup-plugin-strip-code'
import versionInjector from 'rollup-plugin-version-injector'

import pkg from '../../package.json' with { type: 'json' }
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

export const createPluginsProd = (file) => {
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
      hook: 'closeBundle',
      targets,
      verbose: true,
    }),
    stripCode({
      start_comment: 'TEST CODE START',
      end_comment: 'TEST CODE END',
    }),
    ...pluginsBase(process.env.DEBUG !== '1')(),
  ]
}

// TypeScript plugin helpers for Rollup-based builds
const TS_GLOBAL = 'packages/global.d.ts'
const TS_COMMON = 'packages/common/**/*.ts'
const TS_CORE = 'packages/core/**/*.ts'
const TS_CONFIG = './tsconfig.build.json'
const TS_EXCLUDE = ['**/*.test.ts', '**/*.test.tsx']

export const typescriptCore = () =>
  typescript({
    tsconfig: TS_CONFIG,
    include: [TS_GLOBAL, TS_COMMON, TS_CORE],
    exclude: TS_EXCLUDE,
  })

export const typescriptParent = () =>
  typescript({
    tsconfig: TS_CONFIG,
    include: [TS_GLOBAL, TS_COMMON, TS_CORE, 'packages/parent/**/*.ts'],
    exclude: TS_EXCLUDE,
  })

export const typescriptChild = () =>
  typescript({
    tsconfig: TS_CONFIG,
    include: [TS_GLOBAL, TS_COMMON, 'packages/child/**/*.ts'],
    exclude: TS_EXCLUDE,
  })

// Export createBanner for use in browser/test builds

export { default as createBanner } from './banner.js'
