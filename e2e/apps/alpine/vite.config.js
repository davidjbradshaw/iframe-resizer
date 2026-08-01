import { defineConfig } from 'vite'

export default defineConfig({
  base: '/e2e/fixtures/alpine/',
  build: {
    outDir: '../../fixtures/alpine',
    emptyOutDir: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
})
