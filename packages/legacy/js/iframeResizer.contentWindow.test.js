import { describe, it } from 'vitest'

describe('legacy/js/iframeResizer.contentWindow', () => {
  it('imports child/index without error', async () => {
    await import('./iframeResizer.contentWindow.js')
  })
})
