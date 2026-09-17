import { defineConfig } from 'vite'

export default defineConfig({
  base: '/e2e/fixtures/web-component/',
  build: {
    outDir: '../../fixtures/web-component',
    emptyOutDir: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
})
