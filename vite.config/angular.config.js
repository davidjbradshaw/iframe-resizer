import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { commonAlias, createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  resolve: { alias: [commonAlias] },
  build: {
    lib: {
      entry: './packages/angular/directive.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/angular',
    emptyOutDir: false,
    rollupOptions: {
      external: (id) =>
        [
          '@iframe-resizer/core',
          'auto-console-group',
          '@angular/core',
        ].includes(id) || id.startsWith('@iframe-resizer/common/'),
    },
    minify: 'esbuild',
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
