import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@iframe-resizer/core': resolve(__dirname, '../../dist/core/index.esm.js'),
      '@iframe-resizer/vue/sfc': resolve(__dirname, '../../dist/vue/iframe-resizer.vue'),
      '@iframe-resizer/vue': resolve(__dirname, '../../dist/vue'),
      'auto-console-group': resolve(__dirname, './node_modules/auto-console-group')
    }
  },
  build: {
    rollupOptions: {
      external: []
    }
  }
})
