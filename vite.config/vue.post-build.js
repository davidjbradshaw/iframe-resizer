import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function vuePostBuild() {
  const root = join(__dirname, '..')

  // Copy SFC file
  copyFileSync(
    join(root, 'packages/vue/iframe-resizer.vue'),
    join(root, 'dist/vue/iframe-resizer.vue'),
  )

  // Copy SFC type declarations
  copyFileSync(
    join(root, 'packages/vue/iframe-resizer.vue.d.ts'),
    join(root, 'dist/vue/iframe-resizer.vue.d.ts'),
  )

  // Fix import paths in generated JS files
  const files = ['index.umd.js', 'index.esm.js', 'index.cjs.js']
  for (const file of files) {
    const filePath = join(root, 'dist/vue', file)
    const content = readFileSync(filePath, 'utf8')
    const fixed = content.replace(/packages\/vue/g, '.')
    writeFileSync(filePath, fixed)
  }
}
