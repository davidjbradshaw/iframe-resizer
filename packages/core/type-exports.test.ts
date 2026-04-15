import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TYPE_EXPORTS = [
  'IframeComponent',
  'IframeDirection',
  'IframeLogOption',
  'IframeMessageData',
  'IframeMouseData',
  'IframeObject',
  'IframeOptions',
  'IframeResizedData',
  'IframeScrollData',
  'IframeScrollOption',
]

const PACKAGES: Record<string, string> = {
  alpine: 'index.ts',
  angular: 'directive.ts',
  astro: 'index.ts',
  parent: 'esm.ts',
  react: 'index.tsx',
  solid: 'index.ts',
  svelte: 'index.ts',
  vue: 'index.ts',
}

const SFC_DECLARATIONS: Record<string, string> = {
  svelte: 'IframeResizer.svelte.d.ts',
  vue: 'iframe-resizer.vue.d.ts',
}

describe('type re-exports', () => {
  for (const [pkg, file] of Object.entries(PACKAGES)) {
    it(`@iframe-resizer/${pkg} re-exports all shared types`, () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const source = readFileSync(resolve(__dirname, '..', pkg, file), 'utf8')

      for (const typeName of TYPE_EXPORTS) {
        expect(
          source,
          `${typeName} should be exported from @iframe-resizer/${pkg}`,
        ).toMatch(new RegExp(`export[^}]*\\b${typeName}\\b`))
      }
    })
  }

  for (const [pkg, file] of Object.entries(SFC_DECLARATIONS)) {
    it(`@iframe-resizer/${pkg} .d.ts exports option types`, () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const source = readFileSync(
        resolve(__dirname, '../../dist', pkg, file),
        'utf8',
      )

      for (const typeName of [
        'IframeDirection',
        'IframeLogOption',
        'IframeScrollOption',
      ]) {
        expect(source, `${typeName} should be exported from ${file}`).toMatch(
          new RegExp(`\\b${typeName}\\b`),
        )
      }
    })
  }
})
