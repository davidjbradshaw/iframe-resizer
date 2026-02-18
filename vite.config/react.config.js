import { babel } from '@rollup/plugin-babel'
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/react/index.jsx',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/react',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@iframe-resizer/core',
        'auto-console-group',
        /@babel\/runtime/,
      ],
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    ...createPluginsProd('react'),
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
    }),
    copy({
      hook: 'closeBundle',
      targets: [
        {
          src: 'packages/react/index.d.ts',
          dest: 'dist/react/',
          rename: 'iframe-resizer.react.d.ts',
        },
      ],
    }),
  ],
})
