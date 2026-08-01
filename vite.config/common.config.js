import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd, terserWithBanner } from './shared/plugins.js'

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
    ...terserWithBanner('common'),
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/global.d.ts', 'packages/common/**/*.ts'],
      exclude: ['packages/common/**/*.test.*'],
      outDir: 'dist/common',
      entryRoot: 'packages/common',
      rollupTypes: true,
      afterBuild: async () => {
        const { existsSync, renameSync } = await import('node:fs')
        const src = 'dist/common/index.esm.d.ts'
        const dest = 'dist/common/index.d.ts'
        if (existsSync(src)) renameSync(src, dest)
      },
    }),
    ...createPluginsProd('common'),
  ],
})
