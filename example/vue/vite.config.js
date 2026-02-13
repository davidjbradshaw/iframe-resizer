import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/example/vue/dist/',
  resolve: {
    alias: {
      '@iframe-resizer/core': path.resolve(__dirname, '../../dist/core/index.esm.js'),
      '@iframe-resizer/vue/sfc': path.resolve(__dirname, '../../dist/vue/iframe-resizer.vue'),
      '@iframe-resizer/vue': path.resolve(__dirname, '../../dist/vue'),
      'auto-console-group': path.resolve(__dirname, '../../node_modules/auto-console-group'),
    },
  },
  optimizeDeps: {
    include: ['@iframe-resizer/core', '@iframe-resizer/vue', 'auto-console-group'],
  },
})
