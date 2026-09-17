import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  base: '/e2e/fixtures/svelte/',
  build: {
    outDir: '../../fixtures/svelte',
    emptyOutDir: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
})
