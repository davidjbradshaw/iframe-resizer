import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

import { createPluginsProd, terserMinify } from './shared/plugins.js'

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
      external: [
        /^@iframe-resizer\/common/,
        /^solid-js/,
        '@iframe-resizer/core',
        'auto-console-group',
      ],
    },
    ...terserMinify(),
    sourcemap: process.env.BETA === '1',
  },
  plugins: [solid(), ...createPluginsProd('solid')],
})
