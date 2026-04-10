import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

import { createPluginsProd, terserWithBanner } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/svelte/index.ts',
      name: 'IframeResizer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    outDir: 'dist/svelte',
    emptyOutDir: false,
    rollupOptions: {
      external: (id) =>
        id === 'svelte' ||
        id.startsWith('svelte/') ||
        id === '@iframe-resizer/core' ||
        id === 'auto-console-group',
    },
    ...terserWithBanner('svelte'),
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: false,
      },
    }),
    ...createPluginsProd('svelte'),
  ],
})
