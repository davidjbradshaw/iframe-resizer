import { describe, expect, test } from 'vitest'

describe('Astro package type re-exports', () => {
  test('exports types from @iframe-resizer/core', async () => {
    const mod = await import('./index')
    expect(mod).toBeDefined()
  })
})
