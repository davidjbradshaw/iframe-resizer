import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// Builds the finding 16.2 confirmation page into e2e/fixtures/confirm/,
// using the Solid e2e app's installed dependencies
export default defineConfig({
  plugins: [solid()],
  base: '/e2e/fixtures/confirm/16.2-solid-early-update/',
  build: {
    outDir: '../../../fixtures/confirm/16.2-solid-early-update',
    emptyOutDir: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
})
