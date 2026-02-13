import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// In development, use source files; in production/build, use dist
const isDev = process.env.NODE_ENV !== 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/example/react/dist/',
  resolve: {
    alias: isDev ? {
      '@iframe-resizer/react': path.resolve(__dirname, '../../packages/react/index.jsx'),
      '@iframe-resizer/core': path.resolve(__dirname, '../../packages/core/index.js'),
      '@iframe-resizer/child': path.resolve(__dirname, '../../packages/child/index.js'),
    } : {},
    dedupe: ['@iframe-resizer/core', 'auto-console-group'],
  },
  optimizeDeps: {
    include: ['auto-console-group'],
  },
})
