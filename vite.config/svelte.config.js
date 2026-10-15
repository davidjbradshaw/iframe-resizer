import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

import svelteConfig from '../svelte.config.js'
import { createPluginsProd, terserMinify } from './shared/plugins.js'

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
      external: [
        /^@iframe-resizer\/common/,
        /^svelte/,
        '@iframe-resizer/core',
        'auto-console-group',
      ],
    },
    ...terserMinify(),
    sourcemap: process.env.BETA === '1',
  },
  plugins: [
    svelte({ ...svelteConfig, configFile: false }),
    ...createPluginsProd('svelte'),
  ],
})
