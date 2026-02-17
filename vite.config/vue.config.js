import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/vue/index.ts',
      name: 'IframeResizer',
      formats: ['umd', 'es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    outDir: 'dist/vue',
    emptyOutDir: false,
    rollupOptions: {
      external: ['vue', '@iframe-resizer/core', 'auto-console-group'],
      output: {
        globals: {
          vue: 'Vue',
          '@iframe-resizer/core': 'connectResizer',
          'auto-console-group': 'acg',
        },
      },
    },
    minify: 'esbuild',
    sourcemap: process.env.BETA || false,
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('iframe-resizer'),
        },
      },
    }),
    dts({
      include: ['packages/vue/**/*.ts'],
      exclude: ['packages/vue/**/*.vue'],
      outDir: 'dist/vue',
    }),
    ...createPluginsProd('vue'),
  ],
})
