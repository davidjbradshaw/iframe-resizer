import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import serveChild from '../shared/serve-child.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [serveChild(), vue()],
  base: '/example/vue/dist/',
  resolve: {
    preserveSymlinks: true,
  },
})
