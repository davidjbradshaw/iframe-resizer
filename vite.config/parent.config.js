import { existsSync, renameSync } from 'node:fs'

import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { commonAlias, createPluginsProd } from './shared/plugins.js'

const filterDeps = (contents) => {
  const pkg = JSON.parse(contents)
  delete pkg.dependencies.react
  delete pkg.dependencies.vue
  delete pkg.dependencies['@angular/core']
  delete pkg.private
  return JSON.stringify(pkg, null, 2)
}

export default defineConfig({
  resolve: { alias: [commonAlias] },
  build: {
    lib: {
      entry: './packages/parent/esm.ts',
      name: 'iframeResize',
      formats: ['umd', 'es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    outDir: 'dist/parent',
    emptyOutDir: false,
    rollupOptions: {
      external: (id) =>
        id === '@iframe-resizer/core' ||
        id === 'auto-console-group' ||
        id.startsWith('@iframe-resizer/common/'),
      output: {
        globals: {
          '@iframe-resizer/core': 'connectResizer',
          'auto-console-group': 'acg',
        },
      },
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/parent/esm.ts', 'packages/parent/factory.ts'],
      outDir: 'dist/parent',
      entryRoot: 'packages/parent',
      rollupTypes: true,
      afterBuild: () => {
        const src = 'dist/parent/index.esm.d.ts'
        const dest = 'dist/parent/index.d.ts'
        if (existsSync(src)) renameSync(src, dest)
      },
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
})
