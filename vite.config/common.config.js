import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd, terserMinify } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/common/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/common',
    emptyOutDir: false,
    rollupOptions: {
      external: ['auto-console-group'],
    },
    ...terserMinify(),
    sourcemap: process.env.BETA === '1',
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/global.d.ts', 'packages/common/**/*.ts'],
      exclude: ['packages/common/**/*.test.*'],
      entryRoot: 'packages/common',
    }),
    ...createPluginsProd('common'),
  ],
})
