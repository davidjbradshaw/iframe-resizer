import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function solidPostBuild() {
  const root = join(__dirname, '..')

  try {
    // Copy source files for bundlers that use the `solid` exports condition.
    // IframeResizer.tsx is the entry; wire-options.ts and types.ts are relative
    // dependencies, and types.ts also provides the published types.
    const sourceFiles = ['IframeResizer.tsx', 'types.ts', 'wire-options.ts']
    for (const file of sourceFiles) {
      const src = join(root, 'packages/solid', file)
      const dest = join(root, 'dist/solid', file)
      if (!existsSync(src)) {
        throw new Error(`Source file not found: ${src}`)
      }
      copyFileSync(src, dest)
    }

    // Write index.d.ts declaring the component and re-exporting its types,
    // matching packages/solid/index.ts
    writeFileSync(
      join(root, 'dist/solid/index.d.ts'),
      [
        `import type { JSX } from 'solid-js'`,
        `import type { IFrameResizerProps } from './types'`,
        ``,
        `export type { IFrameResizerMethods, IFrameResizerProps } from './types'`,
        `export type * from '@iframe-resizer/core'`,
        ``,
        `declare function IframeResizer(props: IFrameResizerProps): JSX.Element`,
        `export default IframeResizer`,
        ``,
      ].join('\n'),
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
    if (
      error.code &&
      typeof error.code === 'string' &&
      !error.message.includes('not found')
    ) {
      throw new Error(
        `Solid post-build failed with ${error.code}: ${error.message}`,
      )
    }
    throw error
  }
}
