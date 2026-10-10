import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'

import { createPluginsProd, terserMinify } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/child/index.ts',
      name: 'iframeResizerChild',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/child',
    emptyOutDir: false,
    rollupOptions: {
      external: [/^@iframe-resizer\/common/, 'auto-console-group'],
    },
    ...terserMinify(),
    sourcemap: process.env.BETA === '1',
  },
  plugins: [
    ...createPluginsProd('child'),
    copy({
      hook: 'closeBundle',
      targets: [
        {
          src: 'packages/child/index.d.ts',
          dest: 'dist/child/',
        },
      ],
    }),
  ],
})
