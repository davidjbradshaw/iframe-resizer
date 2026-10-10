import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync } from 'node:fs'

import { defineConfig } from 'vite'

import { createPluginsProd } from './shared/plugins.js'

const TOOLCHAIN = 'build-scripts/angular'
const NGC = `${TOOLCHAIN}/node_modules/.bin/ngc`
const NGC_OUT = 'node_modules/.cache/angular-ngc'

// Compiles the directive with Angular 16's compiler in partial-Ivy mode, so
// apps on Angular 16 and later can link it. Vite then bundles that output.
const angularCompiler = () => ({
  name: 'iframe-resizer:ngc',
  buildStart() {
    // Installs the toolchain on the first build. Its packages are dependencies,
    // not devDependencies, as npm skips those under vite's NODE_ENV=production
    if (!existsSync(NGC)) {
      execFileSync(
        'npm',
        ['ci', '--prefix', TOOLCHAIN, '--no-audit', '--no-fund'],
        { stdio: 'inherit' },
      )
    }
    execFileSync(NGC, ['-p', `${TOOLCHAIN}/tsconfig.json`], {
      stdio: 'inherit',
    })
  },
  writeBundle() {
    copyFileSync(`${NGC_OUT}/directive.d.ts`, 'dist/angular/directive.d.ts')
  },
})

export default defineConfig({
  build: {
    lib: {
      entry: `./${NGC_OUT}/directive.js`,
      formats: ['es', 'cjs'],
      // The Angular Package Format path: Analog only links files under fesm20*
      fileName: (format) =>
        format === 'es'
          ? 'fesm2022/iframe-resizer-angular.mjs'
          : 'index.cjs.js',
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
    // Angular's linker reads the declarations as written, and minifying
    // rewrites them (true becomes !0), so this bundle stays unminified
    minify: false,
    sourcemap: process.env.BETA === '1',
  },
  plugins: [angularCompiler(), ...createPluginsProd('angular')],
})
