import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import serveChild from '../shared/serve-child.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [serveChild(), svelte()],
  base: '/example/svelte/dist/',
})
