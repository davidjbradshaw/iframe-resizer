import resolve from '@rollup/plugin-node-resolve'

import { output } from './shared/output.js'
import { createPluginsProd } from './shared/plugins.js'

export default [
  // ESM + CJS (external core)
  {
    input: 'packages/jquery/plugin.js',
    output: [output('jquery')('esm'), output('jquery')('cjs')],
    external: ['@iframe-resizer/core', 'auto-console-group'],
    plugins: createPluginsProd('jquery'),
  },

  // UMD (bundled core)
  {
    input: 'packages/jquery/plugin.js',
    output: {
      name: 'iframeResize',
      ...output('jquery')('umd'),
    },
    plugins: [...createPluginsProd('jquery'), resolve()],
  },
]
