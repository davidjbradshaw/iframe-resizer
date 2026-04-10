import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd, terserWithBanner } from './shared/plugins.js'

export default defineConfig({
  resolve: {
    alias: { '@iframe-resizer/common': './packages/common/index.ts' },
  },
  build: {
    lib: {
      entry: './packages/react/index.tsx',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/react',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        '@iframe-resizer/common',
        '@iframe-resizer/core',
        'auto-console-group',
        'react',
        'react-dom',
      ],
    },
    ...terserWithBanner('react'),
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: [
        'packages/global.d.ts',
        'packages/react/**/*.ts',
        'packages/react/**/*.tsx',
      ],
      exclude: ['packages/react/**/*.test.*'],
      outDir: 'dist/react',
      entryRoot: 'packages/react',
    }),
    ...createPluginsProd('react'),
  ],
})
