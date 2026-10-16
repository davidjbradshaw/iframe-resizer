import { defineConfig } from 'vite'
import angular from '@analogjs/vite-plugin-angular'

export default defineConfig({
  plugins: [angular({ tsconfig: 'tsconfig.json', jit: false })],
  base: '/e2e/fixtures/angular/',
  build: {
    outDir: '../../fixtures/angular',
    emptyOutDir: true,
    // With three pages, Vite puts its preload polyfill in their shared chunk,
    // which then loads before zone.js; zone.js has to load first
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        main: 'index.html',
        zone: 'zone.html',
        zoneless: 'zoneless.html',
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
})
