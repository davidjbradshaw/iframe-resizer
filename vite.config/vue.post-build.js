import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function vuePostBuild() {
  const root = join(__dirname, '..')

  // Copy SFC file
  const srcVueFile = join(root, 'packages/vue/iframe-resizer.vue')
  const destVueFile = join(root, 'dist/vue/iframe-resizer.vue')

  try {
    if (!existsSync(srcVueFile)) {
      throw new Error(`Source file not found: ${srcVueFile}`)
    }
    if (!existsSync(dirname(destVueFile))) {
      throw new Error(
        `Destination directory not found: ${dirname(destVueFile)}`,
      )
    }
    copyFileSync(srcVueFile, destVueFile)
  } catch (error) {
    throw new Error(`Failed to copy SFC file: ${error.message}`)
  }

  // Copy SFC type declarations
  const srcDtsFile = join(root, 'packages/vue/iframe-resizer.vue.d.ts')
  const destDtsFile = join(root, 'dist/vue/iframe-resizer.vue.d.ts')

  try {
    if (!existsSync(srcDtsFile)) {
      throw new Error(`Source file not found: ${srcDtsFile}`)
    }
    if (!existsSync(dirname(destDtsFile))) {
      throw new Error(
        `Destination directory not found: ${dirname(destDtsFile)}`,
      )
    }
    copyFileSync(srcDtsFile, destDtsFile)
  } catch (error) {
    throw new Error(`Failed to copy type declarations: ${error.message}`)
  }

  // Fix import paths in generated JS files
  const files = ['index.umd.js', 'index.esm.js', 'index.cjs.js']
  for (const file of files) {
    const filePath = join(root, 'dist/vue', file)

    try {
      if (!existsSync(filePath)) {
        throw new Error(`Generated file not found: ${filePath}`)
      }

      const content = readFileSync(filePath, 'utf8')
      const fixed = content.replace(/packages\/vue/g, '.')
      writeFileSync(filePath, fixed)
    } catch (error) {
      throw new Error(`Failed to fix import paths in ${file}: ${error.message}`)
    }
  }
}
