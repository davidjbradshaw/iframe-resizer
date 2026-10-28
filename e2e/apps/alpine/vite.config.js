import { defineConfig } from 'vite'

export default defineConfig({
  base: '/e2e/fixtures/alpine/',
  build: {
    outDir: '../../fixtures/alpine',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        'early-update': 'early-update.html',
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
})
