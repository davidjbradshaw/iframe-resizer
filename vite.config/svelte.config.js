import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/svelte/index.js',
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
    minify: 'esbuild',
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
