import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function vuePostBuild() {
  const root = join(__dirname, '..')

  try {
    // Copy SFC file
    const sfcSource = join(root, 'packages/vue/iframe-resizer.vue')
    const sfcDest = join(root, 'dist/vue/iframe-resizer.vue')

    if (!existsSync(sfcSource)) {
      throw new Error(`Source file not found: ${sfcSource}`)
    }

    try {
      copyFileSync(sfcSource, sfcDest)
    } catch (error) {
      throw new Error(
        `Failed to copy SFC file from ${sfcSource} to ${sfcDest}: ${error.message}`,
      )
    }

    // Copy SFC type declarations
    const dtsSource = join(root, 'packages/vue/iframe-resizer.vue.d.ts')
    const dtsDest = join(root, 'dist/vue/iframe-resizer.vue.d.ts')

    if (!existsSync(dtsSource)) {
      throw new Error(`Type declaration file not found: ${dtsSource}`)
    }

    try {
      copyFileSync(dtsSource, dtsDest)
    } catch (error) {
      throw new Error(
        `Failed to copy type declarations from ${dtsSource} to ${dtsDest}: ${error.message}`,
      )
    }

    // Fix import paths in generated JS files
    const files = ['index.umd.js', 'index.esm.js', 'index.cjs.js']
    for (const file of files) {
      const filePath = join(root, 'dist/vue', file)

      if (!existsSync(filePath)) {
        throw new Error(
          `Generated file not found: ${filePath}. Make sure the build completed successfully.`,
        )
      }

      try {
        const content = readFileSync(filePath, 'utf8')
        const fixed = content.replace(/packages\/vue/g, '.')
        writeFileSync(filePath, fixed)
      } catch (error) {
        throw new Error(
          `Failed to fix import paths in ${filePath}: ${error.message}`,
        )
      }
    }
  } catch (error) {
    // If error already has context, rethrow it; otherwise add context
    if (
      error.message.includes('Failed to') ||
      error.message.includes('not found')
    ) {
      throw error
    }
    throw new Error(`Vue post-build failed: ${error.message}`)
  }
}
