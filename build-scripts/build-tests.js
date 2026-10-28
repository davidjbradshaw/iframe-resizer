import { rmSync } from 'node:fs'

import resolve from '@rollup/plugin-node-resolve'
import { rollup } from 'rollup'

import {
  injectVersion,
  typescriptChild,
  typescriptParent,
} from '../vite.config/shared/plugins.js'

const configs = [
  {
    input: 'packages/child/index.ts',
    output: {
      file: 'test/js/iframe-resizer.child.js',
      format: 'iife',
    },
    plugins: [typescriptChild(), resolve(), ...injectVersion()],
  },
  {
    input: 'packages/parent/umd.ts',
    output: {
      file: 'test/js/iframe-resizer.parent.js',
      format: 'umd',
      name: 'iframeResize',
    },
    plugins: [typescriptParent(), resolve(), ...injectVersion()],
  },
  {
    input: 'packages/jquery/plugin.js',
    output: {
      file: 'test/js/iframe-resizer.jquery.js',
      format: 'umd',
      name: 'iframeResize',
    },
    plugins: [typescriptParent(), resolve(), ...injectVersion()],
  },
]

export default async function buildTests() {
  // Emptied here for the same reason as js/ in build-browser.js
  rmSync('test/js', { recursive: true, force: true })

  for (const config of configs) {
    const bundle = await rollup(config)
    await bundle.write(config.output)
    await bundle.close()
  }
}
