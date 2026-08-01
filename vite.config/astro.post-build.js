import { copyFileSync, existsSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function astroPostBuild() {
  const root = join(__dirname, '..')
  const dist = join(root, 'dist/astro')

  // Copy Astro component
  const source = join(root, 'packages/astro/IframeResizer.astro')
  const dest = join(dist, 'IframeResizer.astro')

  if (!existsSync(source)) {
    throw new Error(`Source file not found: ${source}`)
  }

  copyFileSync(source, dest)

  // Remove empty JS files (index.ts only exports types, which erase at compile time)
  for (const file of ['index.esm.js', 'index.cjs.js']) {
    const filePath = join(dist, file)
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }
  }
}
