import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import replace from '@rollup/plugin-replace'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// In development, use source files; in production/build, use dist
const isDev = process.env.NODE_ENV !== 'production'

// Get version from root package.json
const rootPkgPath = path.resolve(__dirname, '../../package.json')
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'))
const version = rootPkg.version

// Check if dist directories exist when building for production
function checkDistDirectories() {
  return {
    name: 'check-dist-directories',
    buildStart() {
      if (!isDev) {
        const distReactPath = path.resolve(__dirname, '../../dist/react')
        const distCorePath = path.resolve(__dirname, '../../dist/core')
        
        const reactExists = fs.existsSync(distReactPath)
        const coreExists = fs.existsSync(distCorePath)
        
        if (!reactExists || !coreExists) {
          const missing = []
          if (!reactExists) missing.push('dist/react')
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
  plugins: [
    // Use @rollup/plugin-replace to inject version in dev mode
    // This is a well-maintained off-the-shelf plugin used by the Rollup team
    isDev && replace({
      preventAssignment: true,
      include: '**/packages/**', // Only replace in packages directory
      values: {
        '[VI]{version}[/VI]': version,
      },
    }),
    checkDistDirectories(),
    react()
  ].filter(Boolean),
  base: isDev ? '/' : '/example/react/dist/',
  resolve: {
    alias: isDev ? {
      '@iframe-resizer/react': path.resolve(__dirname, '../../packages/react/index.tsx'),
      '@iframe-resizer/core': path.resolve(__dirname, '../../packages/core/index.js'),
      '@iframe-resizer/child': path.resolve(__dirname, '../../packages/child/index.js'),
    } : {},
    dedupe: ['@iframe-resizer/core', 'auto-console-group'],
  },
  optimizeDeps: {
    include: ['auto-console-group'],
  },
})
