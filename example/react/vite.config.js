import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/example/react/dist/',
  resolve: {
    dedupe: ['@iframe-resizer/core', 'auto-console-group'],
  },
  optimizeDeps: {
    include: ['@iframe-resizer/react', '@iframe-resizer/core', 'auto-console-group'],
  },
})
