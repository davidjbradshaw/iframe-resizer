import { svelte } from '@sveltejs/vite-plugin-svelte'
import replace from '@rollup/plugin-replace'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// In development, use source files; in production/build, use dist
const isDev = process.env.NODE_ENV !== 'production'

// Get version from root package.json
const rootPkgPath = path.resolve(__dirname, '../../package.json')
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'))
const version = rootPkg.version

// Serve child pages from the shared html example directory,
// rewriting the child script src to load from the js/ build output
function serveHtmlChildPages() {
  const htmlChildDir = path.resolve(__dirname, '../html/child')
  const jsDir = path.resolve(__dirname, '../../js')
  return {
    name: 'serve-html-child-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/child/')) {
          const filePath = path.join(htmlChildDir, req.url.slice(7).split('?')[0])
          if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf-8')
            content = content.replace(
              /src="[^"]*iframe-resizer\.child\.js"/,
              'src="/js/iframe-resizer.child.js"',
            )
            res.setHeader('Content-Type', 'text/html')
            res.end(content)
            return
          }
        }
        if (req.url?.startsWith('/js/')) {
          const filePath = path.join(jsDir, req.url.slice(4).split('?')[0])
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/javascript')
            res.end(fs.readFileSync(filePath))
            return
          }
        }
        next()
      })
    },
  }
}

// Check if dist directories exist when building for production
function checkDistDirectories() {
  return {
    name: 'check-dist-directories',
    buildStart() {
      if (!isDev) {
        const distSveltePath = path.resolve(__dirname, '../../dist/svelte')
        const distCorePath = path.resolve(__dirname, '../../dist/core')

        const svelteExists = fs.existsSync(distSveltePath)
        const coreExists = fs.existsSync(distCorePath)

        if (!svelteExists || !coreExists) {
          const missing = []
          if (!svelteExists) missing.push('dist/svelte')
          if (!coreExists) missing.push('dist/core')

          throw new Error(
            `\n\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `  Missing Required Build Directories\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `  The following directories are missing:\n` +
              `    ${missing.map((m) => `• ${m}`).join('\n    ')}\n\n` +
              `  These are created by building the main iframe-resizer project.\n\n` +
              `  To fix this, run the following command from the repository root:\n\n` +
              `    npm run vite:prod\n\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
          )
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    isDev &&
      replace({
        preventAssignment: true,
        include: '**/packages/**',
        values: {
          '[VI]{version}[/VI]': version,
        },
      }),
    serveHtmlChildPages(),
    checkDistDirectories(),
    svelte(),
  ].filter(Boolean),
  base: isDev ? '/' : '/example/svelte/dist/',
  resolve: {
    alias: isDev
      ? {
          '@iframe-resizer/svelte': path.resolve(
            __dirname,
            '../../packages/svelte/IframeResizer.svelte',
          ),
          '@iframe-resizer/core': path.resolve(
            __dirname,
            '../../packages/core/index.js',
          ),
          '@iframe-resizer/child': path.resolve(
            __dirname,
            '../../packages/child/index.js',
          ),
        }
      : {},
    dedupe: ['@iframe-resizer/core', 'auto-console-group'],
  },
  optimizeDeps: {
    include: ['auto-console-group'],
  },
})
