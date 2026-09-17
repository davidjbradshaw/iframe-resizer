import { defineConfig } from 'astro/config'
import serveChild from '../shared/serve-child.js'

export default defineConfig({
  vite: {
    plugins: [serveChild()],
  },
})
