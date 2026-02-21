import { describe, it, expect } from 'vitest'

describe('legacy/js/iframeResizer', () => {
  it('exports iframeResize from parent/umd', async () => {
    const mod = await import('./iframeResizer.js')
    expect(mod.default).toBeDefined()
  })
})
