import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd, terserWithBanner } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/web-component/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/web-component',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        /^@iframe-resizer\/common/,
        '@iframe-resizer/core',
        'auto-console-group',
      ],
    },
    ...terserWithBanner('web-component'),
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/global.d.ts', 'packages/web-component/**/*.ts'],
      exclude: ['packages/web-component/**/*.test.*'],
      outDir: 'dist/web-component',
      entryRoot: 'packages/web-component',
    }),
    ...createPluginsProd('web-component'),
  ],
})
