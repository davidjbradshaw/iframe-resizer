import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  base: '/e2e/fixtures/solid/',
  build: {
    outDir: '../../fixtures/solid',
    emptyOutDir: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
})
