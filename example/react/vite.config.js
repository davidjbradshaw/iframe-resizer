import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pages from '../shared/pages.js'
import serveChild from '../shared/serve-child.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [serveChild(), react()],
  base: '/example/react/dist/',
  build: {
    rollupOptions: {
      input: pages(import.meta.url),
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
})
