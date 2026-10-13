import { beforeEach, describe, expect, it, vi } from 'vitest'

const EVENT = (data): { data: unknown } => ({ data })

describe('child/received/is', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('detects messages intended for iframe-resizer', async () => {
    const { MESSAGE_ID } = await import('@iframe-resizer/common/consts')
    const mod = await import('./is')
    expect(mod.isMessageForUs(EVENT(`${MESSAGE_ID}:x:y`))).toBe(true)
    expect(mod.isMessageForUs(EVENT('other:x:y'))).toBe(false)
  })

  it('detects messages from an iframe on this page', async () => {
    const mod = await import('./is')
    const ownIframe = { parent: window }
    const parentPage = { parent: {} }
    expect(mod.isFromOwnIframe({ source: ownIframe } as any)).toBe(true)
    expect(mod.isFromOwnIframe({ source: parentPage } as any)).toBe(false)
    expect(mod.isFromOwnIframe({ source: null } as any)).toBe(false)
    expect(mod.isFromOwnIframe({ data: 'x' } as any)).toBe(false)
  })

  it('identifies an init message by the booleans the parent sends', async () => {
    const { MESSAGE_ID } = await import('@iframe-resizer/common/consts')
    const mod = await import('./is')

    // The current parent and the v1 parent, which sends only seven fields
    expect(
      mod.isInitMessage(
        EVENT(`${MESSAGE_ID}myId:8:false:true:32:true:true:8px:auto`),
      ),
    ).toBe(true)
    expect(
      mod.isInitMessage(EVENT(`${MESSAGE_ID}myId:0:true:false:32:false:true`)),
    ).toBe(true)

    // An iframe id that is also a message type
    expect(
      mod.isInitMessage(EVENT(`${MESSAGE_ID}message:8:false:false:32:true`)),
    ).toBe(true)

    expect(mod.isInitMessage(EVENT(`${MESSAGE_ID}resize`))).toBe(false)
    expect(mod.isInitMessage(EVENT(`${MESSAGE_ID}x:y:maybe`))).toBe(false)
  })

  it('does not take a user message with a boolean in its body for init', async () => {
    const { MESSAGE_ID } = await import('@iframe-resizer/common/consts')
    const mod = await import('./is')

    for (const body of [
      '["mode:true:1"]',
      '"feature:true:on"',
      '"a:false:b"',
      '"a:valueOf:b"',
      '"a:toString:b"',
      '{"x":"y:true:z"}',
    ]) {
      expect(mod.isInitMessage(EVENT(`${MESSAGE_ID}message:${body}`))).toBe(
        false,
      )
    }
  })
})
