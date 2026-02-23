#!/usr/bin/env node
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { rollup } from 'rollup'
import { build as viteBuild } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const { DEBUG, TEST } = process.env

const packages = [
  { name: 'core', type: 'vite' },
  { name: 'child', type: 'vite' },
  { name: 'parent', type: 'rollup' },
  { name: 'react', type: 'vite' },
  { name: 'vue', type: 'vite', postBuild: true },
  { name: 'angular', type: 'vite' },
  { name: 'astro', type: 'vite', postBuild: true },
  { name: 'jquery', type: 'rollup' },
]

async function buildPackage(pkg) {
  const configPath = join(root, 'vite.config', `${pkg.name}.config.js`)
  const config = await import(pathToFileURL(configPath).href)

  if (pkg.type === 'vite') {
    await viteBuild({ configFile: configPath })
  } else {
    const configs = Array.isArray(config.default)
      ? config.default
      : [config.default]
    for (const cfg of configs) {
      const bundle = await rollup(cfg)
      const outputs = Array.isArray(cfg.output) ? cfg.output : [cfg.output]
      for (const output of outputs) {
        await bundle.write(output)
      }
      await bundle.close()
    }
  }

  if (pkg.postBuild) {
    const postBuildPath = join(root, 'vite.config', `${pkg.name}.post-build.js`)
    const postBuild = await import(pathToFileURL(postBuildPath).href)
    await postBuild.default()
  }
}

async function buildAll() {
  if (!DEBUG) {
    console.log('Building iframe-resizer packages...\n')

    for (const pkg of packages) {
      console.log(`Building ${pkg.name}...`)
      await buildPackage(pkg)
    }
  }

  console.log('\nBuilding browser bundles...')
  const buildBrowser = await import('./build-browser.js')
  await buildBrowser.default()

  if (TEST) {
    console.log('\nBuilding test bundles...')
    const buildTests = await import('./build-tests.js')
    await buildTests.default()
  }

  console.log('\n✅ Build completed successfully!\n')
}

buildAll().catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})
