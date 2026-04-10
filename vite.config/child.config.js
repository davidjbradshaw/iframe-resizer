import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/child/index.ts',
      name: 'iframeResizerChild',
      formats: ['umd', 'es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    outDir: 'dist/child',
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
  plugins: [
    dts({
      include: ['packages/global.d.ts', 'packages/child/**/*.ts'],
      exclude: ['packages/child/**/*.test.*'],
      outDir: 'dist/child',
    }),
    ...createPluginsProd('child'),
  ],
})
