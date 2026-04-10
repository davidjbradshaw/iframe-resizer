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
        preserveModules: false,
      },
      external: ['auto-console-group'],
      treeshake: false,
    },
    minify: false,
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/global.d.ts', 'packages/common/**/*.ts'],
      exclude: ['packages/common/**/*.test.*'],
      outDir: 'dist/common',
      entryRoot: 'packages/common',
    }),
    ...createPluginsProd('common'),
  ],
})
