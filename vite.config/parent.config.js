import resolve from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'

import { output } from './shared/output.js'
import { createPluginsProd, typescriptParent } from './shared/plugins.js'

const filterDeps = (contents) => {
  const pkg = JSON.parse(contents)
  delete pkg.dependencies.react
  delete pkg.dependencies.vue
  delete pkg.dependencies['@angular/core']
  delete pkg.private
  return JSON.stringify(pkg, null, 2)
}

export default [
  // UMD build (bundles dependencies)
  {
    input: 'packages/parent/umd.js',
    output: {
      name: 'iframeResize',
      ...output('parent')('umd'),
    },
    plugins: [typescriptParent(), ...createPluginsProd('parent'), resolve()],
  },

  // ESM + CJS build (external dependencies)
  {
    input: 'packages/parent/esm.js',
    output: [output('parent')('esm'), output('parent')('cjs')],
    external: ['@iframe-resizer/core', 'auto-console-group'],
    plugins: [
      typescriptParent(),
      ...createPluginsProd('parent'),
      copy({
        hook: 'closeBundle',
        targets: [
          {
            src: 'packages/parent/index.d.ts',
            dest: 'dist/parent/',
            rename: 'iframe-resizer.parent.d.ts',
          },
          {
            src: 'dist/parent/package.json',
            dest: 'dist/parent/',
            transform: filterDeps,
          },
        ],
      }),
    ],
  },
]
