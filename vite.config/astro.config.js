import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/astro/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/astro',
    emptyOutDir: false,
    rollupOptions: {
      external: ['@iframe-resizer/core', 'auto-console-group'],
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      include: ['packages/global.d.ts', 'packages/astro/**/*.ts'],
      exclude: ['packages/astro/**/*.test.*'],
      outDir: 'dist/astro',
      entryRoot: 'packages/astro',
    }),
    ...createPluginsProd('astro'),
  ],
})
