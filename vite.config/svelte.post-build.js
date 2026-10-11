import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { compile, preprocess } from 'svelte/compiler'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Svelte 4 cannot compile TypeScript without a preprocessor, so the
// component ships as JavaScript; its types are in the .d.ts files
async function toJavaScript(filename) {
  const { code } = await preprocess(
    readFileSync(filename, 'utf8'),
    vitePreprocess({ script: true, style: false }),
    { filename },
  )
  const js = code.replace(/<script lang="ts">\s*/, '<script>\n')

  compile(js, { filename }) // Throws if any TypeScript is left
  return js
}

export default async function sveltePostBuild() {
  const root = join(__dirname, '..')

  try {
    // Publish the Svelte component file, as JavaScript
    const svelteSource = join(root, 'packages/svelte/IframeResizer.svelte')
    const svelteDest = join(root, 'dist/svelte/IframeResizer.svelte')

    if (!existsSync(svelteSource)) {
      throw new Error(`Source file not found: ${svelteSource}`)
    }

    writeFileSync(svelteDest, await toJavaScript(svelteSource))

    // Write index.d.ts that re-exports the component and the core types,
    // matching packages/svelte/index.ts
    const indexDts = join(root, 'dist/svelte/index.d.ts')
    writeFileSync(
      indexDts,
      `export { default } from './IframeResizer.svelte'\nexport type * from '@iframe-resizer/core'\n`,
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
