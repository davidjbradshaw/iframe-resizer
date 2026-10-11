import { defineConfig } from 'vite'
import angular from '@analogjs/vite-plugin-angular'

export default defineConfig({
  plugins: [angular({ tsconfig: 'tsconfig.json', jit: false })],
  base: '/e2e/fixtures/angular/',
  build: {
    outDir: '../../fixtures/angular',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        'confirm-47': 'confirm-47.html',
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
})
