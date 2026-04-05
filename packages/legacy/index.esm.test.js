import { describe, expect, it } from 'vitest'

describe('legacy/index.esm', () => {
  it('exports backward-compatible object shape', async () => {
    const mod = await import('./index.esm')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('object')
    expect(mod.default).toHaveProperty('iframeResize')
    expect(mod.default).toHaveProperty('iframeResizer')
    expect(mod.default).toHaveProperty('contentWindow')
  })

  it('iframeResize and iframeResizer are the same reference', async () => {
    const mod = await import('./index.esm')
    expect(mod.default.iframeResize).toBe(mod.default.iframeResizer)
  })
})
