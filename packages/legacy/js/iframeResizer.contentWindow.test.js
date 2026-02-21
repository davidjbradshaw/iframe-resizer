import { describe, expect, it } from 'vitest'

describe('legacy/js/iframeResizer.contentWindow', () => {
  it('imports child/index without error', async () => {
    const mod = await import('./iframeResizer.contentWindow.js')
    expect(mod).toBeDefined()
  })
})
