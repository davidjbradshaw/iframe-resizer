import { defineConfig } from 'vite'

import serveChild from '../shared/serve-child.js'

export default defineConfig({
  plugins: [serveChild()],
  base: '/example/web-component/dist/',
})
