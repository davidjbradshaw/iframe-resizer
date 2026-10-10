#!/usr/bin/env node
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { rollup } from 'rollup'
import { build as viteBuild } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const { DEBUG, TEST } = process.env

// One build number for the whole run, e.g. 20261010.142530; the plugins
// add it to the version of dev and test builds
if ((DEBUG || TEST) && !process.env.BUILD_NUMBER) {
  const now = new Date().toISOString()
  process.env.BUILD_NUMBER = `${now.slice(0, 10).replaceAll('-', '')}.${now.slice(11, 19).replaceAll(':', '')}`
}

const packages = [
  { name: 'common', type: 'vite', postBuild: true },
  { name: 'core', type: 'vite', postBuild: true },
  { name: 'child', type: 'vite', postBuild: true },
  { name: 'parent', type: 'vite', postBuild: true },
  { name: 'react', type: 'vite' },
  { name: 'vue', type: 'vite', postBuild: true },
  { name: 'svelte', type: 'vite', postBuild: true },
  { name: 'solid', type: 'vite', postBuild: true },
  { name: 'alpine', type: 'vite' },
  { name: 'web-component', type: 'vite' },
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
  // Dev builds include the packages too, so dist and js/ always come from the
  // same build and share its build number
  console.log('Building iframe-resizer packages...\n')

  for (const pkg of packages) {
    console.log(`Building ${pkg.name}...`)
    await buildPackage(pkg)
  }

  console.log('\nGenerating SFC type declarations...')
  const { default: generateSfcDts } = await import('./generate-sfc-dts.js')
  generateSfcDts()

  console.log('\nBuilding browser bundles...')
  const buildBrowser = await import('./build-browser.js')
  await buildBrowser.default()

  if (TEST) {
    console.log('\nBuilding test bundles...')
    const buildTests = await import('./build-tests.js')
    await buildTests.default()
  }

  const { default: reportSizes } = await import('./report-sizes.js')
  const distDirs = packages.map((pkg) => `dist/${pkg.name}`)
  const note = DEBUG || TEST ? 'logging not stripped' : ''
  reportSizes(root, [...distDirs, 'js'], note)

  console.log('\n✅ Build completed successfully!\n')
}

buildAll().catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})
