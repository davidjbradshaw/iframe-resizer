import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { commonAlias, createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  resolve: { alias: [commonAlias] },
  build: {
    lib: {
      entry: './packages/alpine/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/alpine',
    emptyOutDir: false,
    rollupOptions: {
      external: (id) =>
        ['@iframe-resizer/core', 'auto-console-group', 'alpinejs'].includes(
          id,
        ) || id.startsWith('@iframe-resizer/common/'),
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/global.d.ts', 'packages/alpine/**/*.ts'],
      exclude: ['packages/alpine/**/*.test.*'],
      outDir: 'dist/alpine',
      entryRoot: 'packages/alpine',
    }),
    ...createPluginsProd('alpine'),
  ],
})
