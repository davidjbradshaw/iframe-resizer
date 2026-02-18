import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../../common/utils', () => ({ typeAssert: vi.fn() }))
vi.mock('../console', () => ({ advise: vi.fn() }))
vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('./close', () => ({ default: vi.fn() }))
vi.mock('./disconnect', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: {} }))

const { default: attachMethods } = await import('./attach')
const { default: trigger } = await import('../send/trigger')
const { advise } = await import('../console')
const { typeAssert } = await import('../../common/utils')
const closeIframe = (await import('./close')).default
const disconnect = (await import('./disconnect')).default
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

    expect(typeAssert).toHaveBeenCalled()
    expect(trigger).toHaveBeenCalledWith(
      'Move to anchor',
      'moveToAnchor:hash',
      'if1',
    )

    api.removeListeners()

    expect(advise).toHaveBeenCalled()
    expect(disconnect).toHaveBeenCalledTimes(2)

    api.resize()

    expect(advise).toHaveBeenCalledTimes(2)
    // resize triggers a message as well; total 2 so far (moveToAnchor + resize)
    expect(trigger).toHaveBeenCalledTimes(2)

    api.sendMessage({ a: 1 })

    expect(trigger).toHaveBeenCalledWith('message', 'message:{"a":1}', 'if1')
    expect(trigger).toHaveBeenCalledTimes(3)
  })

  test('does nothing when settings[id] does not exist', () => {
    const iframe = { id: 'missing' }

    attachMethods('missing')

    expect(iframe.iframeResizer).toBeUndefined()
  })
})
