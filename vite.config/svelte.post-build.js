import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function sveltePostBuild() {
  const root = join(__dirname, '..')

  try {
    // Copy Svelte component file
    const svelteSource = join(root, 'packages/svelte/IframeResizer.svelte')
    const svelteDest = join(root, 'dist/svelte/IframeResizer.svelte')

    if (!existsSync(svelteSource)) {
      throw new Error(`Source file not found: ${svelteSource}`)
    }

    copyFileSync(svelteSource, svelteDest)

    // Copy Svelte component type declarations
    const dtsSource = join(root, 'packages/svelte/IframeResizer.svelte.d.ts')
    const dtsDest = join(root, 'dist/svelte/IframeResizer.svelte.d.ts')

    if (!existsSync(dtsSource)) {
      throw new Error(`Type declaration file not found: ${dtsSource}`)
    }

    copyFileSync(dtsSource, dtsDest)

    // Write index.d.ts that re-exports from the component
    const indexDts = join(root, 'dist/svelte/index.d.ts')
    writeFileSync(
      indexDts,
      `export { default } from './IframeResizer.svelte'\nexport type { IframeResizerProps, IframeResizerMethods } from './IframeResizer.svelte'\n`,
    )

    // Fix import paths in generated JS files
    const files = ['index.esm.js', 'index.cjs.js']
    for (const file of files) {
      const filePath = join(root, 'dist/svelte', file)

      if (!existsSync(filePath)) {
        throw new Error(
          `Generated file not found: ${filePath}. Make sure the build completed successfully.`,
        )
      }

      const content = readFileSync(filePath, 'utf8')
      const fixed = content.replace(/packages\/svelte/g, '.')
      writeFileSync(filePath, fixed)
    }
  } catch (error) {
    if (
      error.code &&
      typeof error.code === 'string' &&
      !error.message.includes('not found')
    ) {
      throw new Error(
        `Svelte post-build failed with ${error.code}: ${error.message}`,
      )
    }
    throw error
  }
}
