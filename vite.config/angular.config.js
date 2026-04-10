import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd, terserWithBanner } from './shared/plugins.js'

export default defineConfig({
  resolve: {
    alias: { '@iframe-resizer/common': './packages/common/index.ts' },
  },
  build: {
    lib: {
      entry: './packages/angular/directive.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/angular',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        '@angular/core',
        '@iframe-resizer/common',
        '@iframe-resizer/core',
        'auto-console-group',
      ],
    },
    ...terserWithBanner('angular'),
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/global.d.ts', 'packages/angular/**/*.ts'],
      exclude: ['packages/angular/**/*.test.*'],
      outDir: 'dist/angular',
      entryRoot: 'packages/angular',
    }),
    ...createPluginsProd('angular'),
  ],
})
