import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    outDir: 'dist/common',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        consts: './packages/common/consts.ts',
        deprecate: './packages/common/deprecate.ts',
        'format-advise': './packages/common/format-advise.ts',
        listeners: './packages/common/listeners.ts',
        modal: './packages/common/modal.ts',
        mode: './packages/common/mode.ts',
        pubSub: './packages/common/pubSub.ts',
        utils: './packages/common/utils.ts',
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
      },
      external: ['auto-console-group'],
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      include: ['packages/common/**/*.ts'],
      exclude: ['packages/common/**/*.test.*'],
      outDir: 'dist/common',
      entryRoot: 'packages/common',
    }),
    ...createPluginsProd('common', { skipVersionInjector: true }),
  ],
})
