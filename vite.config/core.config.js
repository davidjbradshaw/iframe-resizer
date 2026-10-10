import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd, terserWithBanner } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/core/index.ts',
      name: 'connectResizer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/core',
    emptyOutDir: false,
    rollupOptions: {
      external: [/^@iframe-resizer\/common/, 'auto-console-group'],
      output: {
        exports: 'named',
      },
    },
    ...terserWithBanner('core'),
    sourcemap: process.env.BETA === '1',
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: [
        'packages/global.d.ts',
        'packages/core/index.ts',
        'packages/core/types.ts',
      ],
      outDir: 'dist/core',
      entryRoot: 'packages/core',
    }),
    ...createPluginsProd('core'),
  ],
})
