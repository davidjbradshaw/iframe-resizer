import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')

// eslint-disable-next-line import/prefer-default-export
export const commonAlias = {
  find: /^@iframe-resizer\/common\/(.*)/,
  replacement: resolve(root, 'packages/common/$1'),
}
