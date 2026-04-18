import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  generateSvelte,
  generateVue,
} from '../../build-scripts/generate-sfc-dts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TYPE_EXPORTS = [
  'IFrameComponent',
  'IFrameDirection',
  'IFrameLogOption',
  'IFrameMessageData',
  'IFrameMouseData',
  'IFrameObject',
  'IFrameOptions',
  'IFrameResizedData',
  'IFrameScrollData',
  'IFrameScrollOption',
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

const SFC_GENERATORS: Record<string, () => string> = {
  svelte: generateSvelte,
  vue: generateVue,
}

const STAR_EXPORT = /export\s+type\s+\*\s+from\s+["']@iframe-resizer\/core["']/

describe('type re-exports', () => {
  for (const [pkg, file] of Object.entries(PACKAGES)) {
    it(`@iframe-resizer/${pkg} re-exports all shared types`, () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const source = readFileSync(resolve(__dirname, '..', pkg, file), 'utf8')

      if (STAR_EXPORT.test(source)) return

      for (const typeName of TYPE_EXPORTS) {
        expect(
          source,
          `${typeName} should be exported from @iframe-resizer/${pkg}`,
        ).toMatch(new RegExp(`export[^}]*\\b${typeName}\\b`))
      }
    })
  }

  for (const [pkg, generate] of Object.entries(SFC_GENERATORS)) {
    it(`@iframe-resizer/${pkg} .d.ts exports option types`, () => {
      const source = generate()

      for (const typeName of [
        'IFrameDirection',
        'IFrameLogOption',
        'IFrameScrollOption',
      ]) {
        expect(
          source,
          `${typeName} should be exported from ${pkg} .d.ts`,
        ).toMatch(new RegExp(`\\b${typeName}\\b`))
      }
    })
  }
})
