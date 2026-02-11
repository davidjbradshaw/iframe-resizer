import { beforeEach, describe, expect, it, vi } from 'vitest'

const EVENT = (data) => ({ data })

describe('child/received/is', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Clean window globals between tests
    delete window.iframeResize
    delete window.jQuery
  })

  it('detects messages intended for iframe-resizer', async () => {
    const { MESSAGE_ID } = await import('../../common/consts')
    const mod = await import('./is')
    expect(mod.isMessageForUs(EVENT(`${MESSAGE_ID}:x:y`))).toBe(true)
    expect(mod.isMessageForUs(EVENT('other:x:y'))).toBe(false)
  })

  it('detects middle tier via window.iframeResize', async () => {
    const mod = await import('./is')
    window.iframeResize = () => {}
    expect(mod.isMiddleTier()).toBe(true)
  })

  it('detects middle tier via jQuery prototype', async () => {
    const mod = await import('./is')
    window.jQuery = { prototype: { iframeResize: () => {} } }
    expect(mod.isMiddleTier()).toBe(true)
  })

  it('identifies init message by boolean flag in third segment', async () => {
    const { SEPARATOR, MESSAGE_ID } = await import('../../common/consts')
    const mod = await import('./is')
    expect(
      mod.isInitMessage(EVENT(`${MESSAGE_ID}${SEPARATOR}x${SEPARATOR}true`)),
    ).toBe(true)
    expect(
      mod.isInitMessage(EVENT(`${MESSAGE_ID}${SEPARATOR}x${SEPARATOR}false`)),
    ).toBe(true)
    expect(
      mod.isInitMessage(EVENT(`${MESSAGE_ID}${SEPARATOR}x${SEPARATOR}maybe`)),
    ).toBe(false)
  })
})
