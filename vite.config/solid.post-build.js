import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function solidPostBuild() {
  const root = join(__dirname, '..')

  try {
    // Copy source component for bundlers that use the `solid` exports condition
    const tsxSource = join(root, 'packages/solid/IframeResizer.tsx')
    const tsxDest = join(root, 'dist/solid/IframeResizer.tsx')

    if (!existsSync(tsxSource)) {
      throw new Error(`Source file not found: ${tsxSource}`)
    }

    copyFileSync(tsxSource, tsxDest)

    // Write index.d.ts that re-exports types from the component
    writeFileSync(
      join(root, 'dist/solid/index.d.ts'),
      `export { default } from './IframeResizer'\nexport type { IframeResizerProps, IframeResizerMethods } from './IframeResizer'\n`,
    )

    // Fix import paths in generated JS files (packages/solid → .)
    for (const file of ['index.esm.js', 'index.cjs.js']) {
      const filePath = join(root, 'dist/solid', file)

      if (!existsSync(filePath)) {
        throw new Error(`Generated file not found: ${filePath}`)
      }

      const fixed = readFileSync(filePath, 'utf8').replace(
        /packages\/solid/g,
        '.',
      )
      writeFileSync(filePath, fixed)
    }
  } catch (error) {
    if (error.code && !error.message.includes('not found')) {
      throw new Error(
        `Solid post-build failed with ${error.code}: ${error.message}`,
      )
    }
    throw error
  }
}
