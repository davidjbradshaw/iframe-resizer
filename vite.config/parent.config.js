import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
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
    input: 'packages/parent/umd.ts',
    output: {
      name: 'iframeResize',
      ...output('parent')('umd'),
    },
    plugins: [typescriptParent(), ...createPluginsProd('parent'), resolve()],
  },

  // ESM + CJS build (external dependencies)
  {
    input: 'packages/parent/esm.ts',
    output: [output('parent')('esm'), output('parent')('cjs')],
    external: ['@iframe-resizer/core', 'auto-console-group'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        include: [
          'packages/global.d.ts',
          'packages/common/**/*.ts',
          'packages/core/**/*.ts',
          'packages/parent/**/*.ts',
        ],
        exclude: ['**/*.test.*'],
        declaration: true,
        declarationDir: 'dist/parent',
      }),
      ...createPluginsProd('parent'),
      copy({
        hook: 'closeBundle',
        targets: [
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
