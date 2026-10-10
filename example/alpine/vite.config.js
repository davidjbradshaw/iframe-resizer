import { defineConfig } from 'vite'
import pages from '../shared/pages.js'
import serveChild from '../shared/serve-child.js'

export default defineConfig({
  plugins: [serveChild()],
  base: '/example/alpine/dist/',
  build: {
    rollupOptions: {
      input: pages(import.meta.url),
    },
  },
})
