import resolve from '@rollup/plugin-node-resolve'
import { rollup } from 'rollup'
import clear from 'rollup-plugin-clear'

import { injectVersion } from '../vite.config/shared/plugins.js'

const configs = [
  {
    input: 'packages/child/index.js',
    output: {
      file: 'test-js/iframe-resizer.child.js',
      format: 'iife',
    },
    plugins: [clear({ targets: ['test-js'] }), resolve(), ...injectVersion()],
  },
  {
    input: 'packages/parent/umd.js',
    output: {
      file: 'test-js/iframe-resizer.parent.js',
      format: 'umd',
      name: 'iframeResize',
    },
    plugins: [resolve(), ...injectVersion()],
  },
  {
    input: 'packages/jquery/plugin.js',
    output: {
      file: 'test-js/iframe-resizer.jquery.js',
      format: 'umd',
      name: 'iframeResize',
    },
    plugins: [resolve(), ...injectVersion()],
  },
]

export default async function buildTests() {
  for (const config of configs) {
    const bundle = await rollup(config)
    await bundle.write(config.output)
    await bundle.close()
  }
}
