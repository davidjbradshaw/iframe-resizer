import angular from '@analogjs/vite-plugin-angular'
import { defineConfig } from 'vite'

import pages from '../shared/pages.js'
import serveChild from '../shared/serve-child.js'

export default defineConfig({
  plugins: [serveChild(), angular({ tsconfig: 'tsconfig.json' })],
  base: '/example/angular/dist/',
  build: {
    rollupOptions: {
      input: pages(import.meta.url),
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
})
