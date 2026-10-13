import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import { createPluginsProd, terserMinify } from './shared/plugins.js'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/vue/index.ts',
      name: 'IframeResizer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    outDir: 'dist/vue',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        /^@iframe-resizer\/common/,
        '@iframe-resizer/core',
        'auto-console-group',
        'vue',
      ],
    },
    ...terserMinify(),
    sourcemap: process.env.BETA === '1',
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
      tsconfigPath: './tsconfig.build.json',
      include: ['packages/global.d.ts', 'packages/vue/**/*.ts'],
      exclude: ['packages/vue/**/*.vue'],
    }),
    ...createPluginsProd('vue'),
  ],
})
