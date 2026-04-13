import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default function serveChild() {
  let childPath

  return {
    name: 'serve-iframe-resizer-child',
    configResolved(config) {
      childPath = join(config.root, 'node_modules/@iframe-resizer/child/index.umd.js')
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/iframe-resizer.child.js') {
          res.setHeader('Content-Type', 'application/javascript')
          res.end(readFileSync(childPath))
          return
        }
        next()
      })
    },
  }
}
