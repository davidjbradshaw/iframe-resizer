import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd } from './shared/plugins.js'

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
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/global.d.ts', 'packages/common/**/*.ts'],
      exclude: ['packages/common/**/*.test.*'],
      outDir: 'dist/common',
      entryRoot: 'packages/common',
    }),
    ...createPluginsProd('common'),
  ],
})
