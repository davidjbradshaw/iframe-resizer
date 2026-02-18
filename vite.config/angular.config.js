import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/angular/directive.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/angular',
    emptyOutDir: false,
    rollupOptions: {
      external: ['@iframe-resizer/core', 'auto-console-group', '@angular/core'],
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      include: ['packages/angular/**/*.ts'],
      outDir: 'dist/angular',
    }),
    ...createPluginsProd('angular'),
  ],
})
