import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { commonAlias, createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  resolve: { alias: [commonAlias] },
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
        'react',
        'react-dom',
        '@iframe-resizer/core',
        'auto-console-group',
      ],
    },
    minify: 'esbuild',
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
