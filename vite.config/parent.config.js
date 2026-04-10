import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'

import { createPluginsProd } from './shared/plugins.js'

const filterDeps = (contents) => {
  const pkg = JSON.parse(contents)
  delete pkg.dependencies.react
  delete pkg.dependencies.vue
  delete pkg.dependencies['@angular/core']
  delete pkg.private
  return JSON.stringify(pkg, null, 2)
}

export default defineConfig({
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
      external: ['@iframe-resizer/core', 'auto-console-group'],
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
    ...createPluginsProd('parent'),
    copy({
      hook: 'closeBundle',
      targets: [
        {
          src: 'packages/parent/index.d.ts',
          dest: 'dist/parent/',
        },
        {
          src: 'dist/parent/package.json',
          dest: 'dist/parent/',
          transform: filterDeps,
        },
      ],
    }),
  ],
})
