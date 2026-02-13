import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// In development, use source files; in production/build, use dist
const isDev = process.env.NODE_ENV !== 'production'

// Check if dist directories exist when building for production
function checkDistDirectories() {
  return {
    name: 'check-dist-directories',
    buildStart() {
      if (!isDev) {
        const distVuePath = path.resolve(__dirname, '../../dist/vue')
        const distCorePath = path.resolve(__dirname, '../../dist/core')
        
        const vueExists = fs.existsSync(distVuePath)
        const coreExists = fs.existsSync(distCorePath)
        
        if (!vueExists || !coreExists) {
          const missing = []
          if (!vueExists) missing.push('dist/vue')
          if (!coreExists) missing.push('dist/core')
          
          throw new Error(
            `\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `  Missing Required Build Directories\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `  The following directories are missing:\n` +
            `    ${missing.map(m => `• ${m}`).join('\n    ')}\n\n` +
            `  These are created by building the main iframe-resizer project.\n\n` +
            `  To fix this, run the following command from the repository root:\n\n` +
            `    npm run vite:prod\n\n` +
            `  Alternatively, if you want to develop without building, run:\n\n` +
            `    npm run dev\n\n` +
            `  (Dev mode uses source files directly from packages/)\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
          )
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [checkDistDirectories(), vue()],
  base: isDev ? '/' : '/example/vue/dist/',
  resolve: {
    alias: isDev ? {
      '@iframe-resizer/vue/sfc': path.resolve(__dirname, '../../packages/vue/iframe-resizer.vue'),
      '@iframe-resizer/core': path.resolve(__dirname, '../../packages/core/index.js'),
      '@iframe-resizer/child': path.resolve(__dirname, '../../packages/child/index.js'),
    } : {},
    dedupe: ['@iframe-resizer/core', 'auto-console-group'],
  },
  optimizeDeps: {
    include: ['auto-console-group'],
  },
})
