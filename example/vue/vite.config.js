import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pages from '../shared/pages.js'
import serveChild from '../shared/serve-child.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [serveChild(), vue()],
  base: '/example/vue/dist/',
  build: {
    rollupOptions: {
      input: pages(import.meta.url),
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
})
