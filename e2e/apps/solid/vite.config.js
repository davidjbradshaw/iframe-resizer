import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  base: '/e2e/fixtures/solid/',
  build: {
    outDir: '../../fixtures/solid',
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
