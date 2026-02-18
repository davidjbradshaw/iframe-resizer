import { defineConfig } from 'vite'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/core/index.ts',
      name: 'connectResizer',
      formats: ['umd', 'es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    outDir: 'dist/core',
    emptyOutDir: false,
    rollupOptions: {
      external: ['auto-console-group'],
      output: {
        globals: {
          'auto-console-group': 'acg',
        },
      },
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: createPluginsProd('core'),
})
