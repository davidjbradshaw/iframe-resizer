/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect } from 'vitest'

describe('svelte/IframeResizer', () => {
  it('exports a Svelte component', async () => {
    const { default: comp } = await import('./IframeResizer.svelte')
    expect(comp).toBeDefined()
  })
})
