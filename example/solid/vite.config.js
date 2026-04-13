import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import serveChild from '../shared/serve-child.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [serveChild(), solid()],
  base: '/example/solid/dist/',
})
