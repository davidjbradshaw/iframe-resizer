import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'

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
    ...createPluginsProd('child'),
    copy({
      hook: 'closeBundle',
      targets: [
        {
          src: 'packages/child/index.d.ts',
          dest: 'dist/child/',
          rename: 'iframe-resizer.child.d.ts',
        },
      ],
    }),
  ],
})
