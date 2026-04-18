import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/e2e/fixtures/vue/',
  build: {
    outDir: '../../fixtures/vue',
    emptyOutDir: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
})
