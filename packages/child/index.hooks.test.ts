/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Simulate test hooks present by adding a #banner element to top.document
describe('child/index test hooks when banner present', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    const banner = document.createElement('div')
    banner.id = 'banner'
    document.body.append(banner)
    vi.restoreAllMocks()
  })

  it('defines mockMsgListener and removes existing window message listener', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    // define AMD define stub so index can safely call it
    // @ts-ignore
    window.define = vi.fn()

    const mod = await import('./index')

    expect(mod).toBeDefined()
    expect(window.mockMsgListener).toBeDefined()
    expect(removeSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
      undefined,
    )
  })
})
