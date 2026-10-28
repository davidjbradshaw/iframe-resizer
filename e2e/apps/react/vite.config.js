import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/e2e/fixtures/react/',
  build: {
    outDir: '../../fixtures/react',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        'early-update': 'early-update.html',
        activity: 'activity.html',
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
})
