import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/e2e/fixtures/react/',
  build: {
    outDir: '../../fixtures/react',
    emptyOutDir: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
})
