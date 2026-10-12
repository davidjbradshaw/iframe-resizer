import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

import { defineConfig } from 'vite'

import { ANGULAR_ESM } from './shared/pkgJson.js'
import { createPluginsProd } from './shared/plugins.js'

const TOOLCHAIN = 'build-scripts/angular'
const NGC = `${TOOLCHAIN}/node_modules/.bin/ngc`
// ngc's output, passed to it as --outDir so this is the only place it is set
const NGC_OUT = 'node_modules/.cache/angular-ngc'
// Hash of the lockfile the toolchain was last installed from
const INSTALLED = `${TOOLCHAIN}/node_modules/.lockfile-hash`

const lockfileHash = () =>
  createHash('sha256')
    .update(readFileSync(`${TOOLCHAIN}/package-lock.json`))
    .digest('hex')

// Installs the toolchain on the first build, and again when its lockfile
// changes. Its packages are dependencies, not devDependencies, as npm skips
// those under vite's NODE_ENV=production
function installToolchain() {
  const hash = lockfileHash()
  const installed = existsSync(INSTALLED) && readFileSync(INSTALLED, 'utf8')
  if (existsSync(NGC) && installed === hash) return

  execFileSync(
    'npm',
    ['ci', '--prefix', TOOLCHAIN, '--no-audit', '--no-fund'],
    { stdio: 'inherit' },
  )
  writeFileSync(INSTALLED, hash)
}

// Compiles the directive with Angular 16's compiler in partial-Ivy mode, so
// apps on Angular 16 and later can link it. Vite then bundles that output.
const angularCompiler = () => {
  // buildStart runs once per output format, so compile once per build
  let compiled = false

  return {
    name: 'iframe-resizer:ngc',
    buildStart() {
      if (compiled) return
      compiled = true
      installToolchain()
      execFileSync(
        NGC,
        ['-p', `${TOOLCHAIN}/tsconfig.json`, '--outDir', NGC_OUT],
        { stdio: 'inherit' },
      )
    },
    closeBundle() {
      compiled = false
      copyFileSync(`${NGC_OUT}/directive.d.ts`, 'dist/angular/directive.d.ts')
    },
  }
}

export default defineConfig({
  build: {
    lib: {
      entry: `./${NGC_OUT}/directive.js`,
      formats: ['es', 'cjs'],
      // Analog's build only links files under fesm20*
      fileName: (format) => (format === 'es' ? ANGULAR_ESM : 'index.cjs.js'),
    },
    outDir: 'dist/angular',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        /^@iframe-resizer\/common/,
        '@angular/core',
        '@iframe-resizer/core',
        'auto-console-group',
      ],
    },
    // Angular libraries ship unminified, and each app's build minifies them
    minify: false,
    sourcemap: process.env.BETA === '1',
  },
  plugins: [angularCompiler(), ...createPluginsProd('angular')],
})
