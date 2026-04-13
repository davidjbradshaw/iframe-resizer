import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import serveChild from '../shared/serve-child.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [serveChild(), react()],
  base: '/example/react/dist/',
  resolve: {
    preserveSymlinks: true,
  },
})
