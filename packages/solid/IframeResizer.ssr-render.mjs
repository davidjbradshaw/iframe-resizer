// Renders the component on the server for IframeResizer.ssr.test.js, compiled
// as SolidStart compiles it. Prints one result per style given as JSON.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createServer } from 'vite'
import solid from 'vite-plugin-solid'

const STUB = '\0stub:'

// Core and the console are not used while rendering on the server
const stubs = {
  '@iframe-resizer/core': 'export default () => () => ({})',
  '@iframe-resizer/common': 'export const esModuleInterop = (m) => m',
  '@iframe-resizer/common/consts':
    "export const EXPAND = 'expanded'; export const LOG_EXPANDED = 2",
  'auto-console-group':
    'export default () => new Proxy({}, { get: () => () => {} })',
}

const server = await createServer({
  appType: 'custom',
  configFile: false,
  logLevel: 'silent',
  plugins: [
    {
      name: 'stub-modules',
      enforce: 'pre',
      resolveId: (id) => (id in stubs ? `${STUB}${id}` : null),
      load: (id) => (id.startsWith(STUB) ? stubs[id.slice(STUB.length)] : null),
    },
    solid({ ssr: true }),
  ],
  root: path.dirname(fileURLToPath(import.meta.url)),
  server: { hmr: false, middlewareMode: true },
})

const [{ renderToString }, { createComponent }, { default: IframeResizer }] =
  await Promise.all([
    server.ssrLoadModule('solid-js/web'),
    server.ssrLoadModule('solid-js'),
    server.ssrLoadModule('./IframeResizer.tsx'),
  ])

const render = (style) => {
  try {
    return {
      html: renderToString(() =>
        createComponent(IframeResizer, {
          license: 'GPLv3',
          src: 'https://example.com/',
          id: 'ssr',
          style,
        }),
      ),
    }
  } catch (error) {
    return { error: error.message }
  }
}

process.stdout.write(JSON.stringify(JSON.parse(process.argv[2]).map(render)))
await server.close()
