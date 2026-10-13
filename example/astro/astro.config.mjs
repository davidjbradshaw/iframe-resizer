import { defineConfig } from 'astro/config'
import serveChild from '../shared/serve-child.js'

export default defineConfig({
  // two.html rather than two/index.html, to match the other examples' links
  build: { format: 'file' },
  vite: {
    plugins: [serveChild()],
  },
})
