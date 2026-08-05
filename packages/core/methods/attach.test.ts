import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('./close', () => ({ default: vi.fn() }))
vi.mock('./disconnect', () => ({ default: vi.fn() }))
vi.mock('./move-to-anchor', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: {} }))

const { default: attachMethods } = await import('./attach')
const { default: trigger } = await import('../send/trigger')
const closeIframe = (await import('./close')).default
const disconnect = (await import('./disconnect')).default
const moveToAnchor = (await import('./move-to-anchor')).default
const settings = (await import('../values/settings')).default

describe('core/methods/attach', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const k of Object.keys(settings)) delete settings[k]
  })

  test('attaches resizer API to iframe and wires methods', () => {
    const iframe = { id: 'if1' }
    settings.if1 = { iframe }

    attachMethods('if1')

    expect(iframe.iframeResizer).toBeDefined()

    const api = iframe.iframeResizer

    api.close()
    expect(closeIframe).toHaveBeenCalledWith(iframe)

    api.disconnect()
    expect(disconnect).toHaveBeenCalledWith(iframe)

    api.moveToAnchor('hash')
    expect(moveToAnchor).toHaveBeenCalledWith('if1', 'hash')

    api.sendMessage({ a: 1 })
    expect(trigger).toHaveBeenCalledWith('message', 'message:{"a":1}', 'if1')
  })

  test('getVersion returns parent and child versions', () => {
    const iframe = { id: 'if1' }
    settings.if1 = { iframe, childVersion: '1.2.3' }

    attachMethods('if1')

    const version = iframe.iframeResizer.getVersion()
    expect(version.parent).toBeTruthy()
    expect(version.child).toBe('1.2.3')
  })

  test('getVersion returns legacy when child version not set', () => {
    const iframe = { id: 'if1' }
    settings.if1 = { iframe }

    attachMethods('if1')

    expect(iframe.iframeResizer.getVersion().child).toBe('legacy')
  })

  test('does nothing when settings[id] does not exist', () => {
    const iframe = { id: 'missing' }

    attachMethods('missing')

    expect(iframe.iframeResizer).toBeUndefined()
  })
})
