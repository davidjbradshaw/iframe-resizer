import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'

import { commonAlias, createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  resolve: { alias: [commonAlias] },
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
      external: (id) =>
        id === 'auto-console-group' || id.startsWith('@iframe-resizer/common/'),
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
        },
      ],
    }),
  ],
})
