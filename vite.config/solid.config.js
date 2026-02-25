import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/solid/index.ts',
      name: 'IframeResizer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    outDir: 'dist/solid',
    emptyOutDir: false,
    rollupOptions: {
      external: (id) =>
        id === 'solid-js' ||
        id.startsWith('solid-js/') ||
        id === '@iframe-resizer/core' ||
        id === 'auto-console-group',
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [solid(), ...createPluginsProd('solid')],
})
