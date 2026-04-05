import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/alpine/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/alpine',
    emptyOutDir: false,
    rollupOptions: {
      external: ['@iframe-resizer/core', 'auto-console-group', 'alpinejs'],
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      include: ['packages/global.d.ts', 'packages/alpine/**/*.ts'],
      exclude: ['packages/alpine/**/*.test.*'],
      outDir: 'dist/alpine',
    }),
    ...createPluginsProd('alpine'),
  ],
})
