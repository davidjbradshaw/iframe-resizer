import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd, terserMinify } from './shared/plugins.js'

export default defineConfig({
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
        /^@iframe-resizer\/common/,
        '@angular/core',
        '@iframe-resizer/core',
        'auto-console-group',
      ],
    },
    ...terserMinify(),
    sourcemap: process.env.BETA === '1',
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
