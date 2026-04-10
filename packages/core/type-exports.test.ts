import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const TYPE_EXPORTS = [
  'IframeComponent',
  'IframeMessageData',
  'IframeMouseData',
  'IframeObject',
  'IframeOptions',
  'IframeResizedData',
  'IframeScrollData',
]

const PACKAGES: Record<string, string> = {
  alpine: 'index.ts',
  angular: 'directive.ts',
  react: 'index.tsx',
  solid: 'index.ts',
  svelte: 'index.ts',
  vue: 'index.ts',
}

describe('type re-exports', () => {
  for (const [pkg, file] of Object.entries(PACKAGES)) {
    it(`@iframe-resizer/${pkg} re-exports all shared types`, () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const source = readFileSync(
        resolve(import.meta.dirname, '..', pkg, file),
        'utf8',
      )

      for (const typeName of TYPE_EXPORTS) {
        expect(source).toContain(typeName)
      }
    })
  }
})
