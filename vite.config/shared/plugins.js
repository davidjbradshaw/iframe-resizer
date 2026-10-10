import { babel } from '@rollup/plugin-babel'
import strip from '@rollup/plugin-strip'
import typescript from '@rollup/plugin-typescript'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import stripCode from 'rollup-plugin-strip-code'

import pkg from '../../package.json' with { type: 'json' }
import createBanner from './banner.js'
import createPkgJson from './pkgJson.js'

const { BETA, DEBUG, TEST } = process.env
const stripLog = !(DEBUG === '1' || BETA === '1' || TEST === '1')

// Dev and test builds add the build number (set by build-all.js) to the
// version, so a parent and child from different builds report a mismatch
const VERSION_TAG = '[VI]{version}[/VI]'
const version = process.env.BUILD_NUMBER
  ? `${pkg.version}+build.${process.env.BUILD_NUMBER}`
  : pkg.version

const versionTag = () => ({
  name: 'iframe-resizer:version',
  transform: (code) =>
    code.includes(VERSION_TAG)
      ? { code: code.replaceAll(VERSION_TAG, version), map: null }
      : null,
})

export const injectVersion = () => [versionTag()]

const BANNER_FORMATS = { es: 'esm', cjs: 'cjs', umd: 'umd', iife: 'iife' }

// Adds the banner after minification, labelled with each output's format
export const formatBanner = (file) => ({
  name: 'iframe-resizer:banner',
  outputOptions: (options) => ({
    ...options,
    postBanner: createBanner(
      file,
      BANNER_FORMATS[options.format] ?? options.format,
    ),
  }),
})

// Removes the child's test hooks. Runs first, while the TEST CODE comments
// are still in the source; the TypeScript transform does not keep them.
export const stripTestCode = () => ({
  ...stripCode({
    start_comment: 'TEST CODE START',
    end_comment: 'TEST CODE END',
  }),
  enforce: 'pre',
})

const stripInclude = ['**/*.js', '**/*.ts']

// Production builds remove log() and debug() calls; other builds remove purge()
const stripCalls = (stripLog) =>
  strip({
    include: stripInclude,
    functions: stripLog ? ['log', 'debug'] : ['purge'],
  })

// For the UMD post-builds, which do not use pluginsBase
export const stripLogging = () => [stripCalls(stripLog)]

export const pluginsBase =
  (stripLog, skipVI = false) =>
  () => {
    const babelPlugin = babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    })

    const base = skipVI ? [babelPlugin] : [babelPlugin, versionTag()]

    return [stripCalls(stripLog), ...base]
  }

const fixVersion = (file) => {
  const common = { '@iframe-resizer/common': pkg.version }

  switch (file) {
    case 'common':
      return {}

    case 'core':
    case 'child':
      return { additionalDependencies: common }

    default:
      return {
        additionalDependencies: {
          ...common,
          '@iframe-resizer/core': pkg.version,
        },
      }
  }
}

const today = new Date().toISOString().split('T').join(' - ')

const createTransform = (file) => (contents) =>
  String(contents)
    .replace(/@@PKG_NAME@@/g, `@iframe-resizer/${file}`)
    .replace(/@@PKG_VERSION@@/g, pkg.version)
    .replace(/@@BUILD_DATE@@/g, today)

export const createPluginsProd = (
  file,
  { skipVersionInjector = false, skipPackageJson = false } = {},
) => {
  const dest = `dist/${file}`
  const src = `packages`

  const transform = createTransform(file)

  const targets = [
    { src: ['LICENSE' /* 'FUNDING.md',  'SECURITY.md' */], dest },
    { src: `${src}/TEMPLATE.md`, dest, rename: 'README.md', transform },
  ]

  return [
    clear({ targets: [dest] }),
    ...(skipPackageJson
      ? []
      : [
          generatePackageJson({
            ...fixVersion(file),
            baseContents: createPkgJson(file),
            outputFolder: dest,
          }),
        ]),
    copy({
      hook: 'closeBundle',
      targets,
      verbose: true,
    }),
    stripTestCode(),
    formatBanner(file),
    ...pluginsBase(stripLog, skipVersionInjector)(),
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

export const typescriptWebComponent = () =>
  typescript({
    tsconfig: TS_CONFIG,
    include: [TS_GLOBAL, TS_COMMON, TS_CORE, 'packages/web-component/**/*.ts'],
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

// Terser config for Vite lib builds — minifies and adds banner
export { default as terserMinify } from './terser.js'
