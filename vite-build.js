#!/usr/bin/env node
/* eslint-disable no-console, no-await-in-loop */
/**
 * Build script using Rollup (which powers Vite) with Vite plugins
 * This script uses the vite.config.js file for configuration
 */

import { rollup, watch as rollupWatch } from 'rollup'

import { default as configs } from './vite.config.js'

const { WATCH } = process.env

async function build() {
  const configArray = Array.isArray(configs) ? configs : [configs]

  for (const config of configArray) {
    try {
      if (WATCH) {
        const watcher = rollupWatch({
          ...config,
          watch: {
            exclude: 'node_modules/**',
          },
        })

        watcher.on('event', (event) => {
          switch (event.code) {
            case 'START': {
              console.log('Build started...')

              break
            }

            case 'BUNDLE_END': {
              console.log(`Build completed in ${event.duration}ms`)

              break
            }

            case 'ERROR': {
              console.error('Build error:', event.error)

              break
            }
            // No default
          }
        })

        // Keep the process running in watch mode (intentional infinite wait)
        await new Promise(() => {
          /* Keep process alive for watch mode */
        })
      } else {
        const bundle = await rollup({
          input: config.input,
          external: config.external,
          plugins: config.plugins,
        })

        const outputs = Array.isArray(config.output)
          ? config.output
          : [config.output]
        for (const output of outputs) {
          await bundle.write(output)
        }

        await bundle.close()
      }
    } catch (error) {
      console.error('Build failed:', error)
      process.exit(1)
    }
  }

  if (!WATCH) {
    console.log('\n✅ Build completed successfully!\n')
  }
}

build()
