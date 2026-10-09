import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@iframe-resizer/common', () => ({
  once: (fn) => fn,
  addEventListener: vi.fn(),
}))
vi.mock('./events/visible', () => ({ default: vi.fn() }))
vi.mock('./console', () => ({
  debug: vi.fn(),
  errorBoundary: (_id, fn) => fn,
  event: vi.fn(),
}))
vi.mock('./received/decode', () => ({
  default: vi.fn(() => ({ id: 'abc', type: 'INIT' })),
  getIframeId: (msg) => msg.slice(13).split(':')[0],
}))
vi.mock('./received/preflight', () => ({
  checkIframeExists: vi.fn(() => true),
  isMessageForUs: vi.fn(() => true),
  isMessageFromIframe: vi.fn(() => true),
  isMessageFromMetaParent: vi.fn(() => false),
}))
vi.mock('./router', () => ({ default: vi.fn() }))
vi.mock('./send/ready', () => ({ default: vi.fn() }))
vi.mock('./values/settings', () => ({ default: {} }))

const { addEventListener } = await import('@iframe-resizer/common')
const { default: routeMessage } = await import('./router')
const { default: iframeReady } = await import('./send/ready')
const preflight = await import('./received/preflight')
const { debug, event: consoleEvent } = await import('./console')
const { CHILD_READY_MESSAGE } = await import('@iframe-resizer/common/consts')

describe('core/listeners', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // ensure fresh module state
    vi.resetModules()
  })

  test('initializes listeners and handles CHILD_READY_MESSAGE via iframeParentListener', async () => {
    const { default: setup } = await import('./listeners')
    setup()

    // window listener is the one with target = window
    const winAddCall = addEventListener.mock.calls.find((c) => c[0] === window)
    const listener = winAddCall[2]

    const event = {
      data: CHILD_READY_MESSAGE,
      source: { name: 'parentWindow' },
      origin: 'https://a.com',
    }
    listener(event)

    expect(iframeReady).toHaveBeenCalledWith(event)
  })

  test('ignored non-iframe strings call console event and debug', async () => {
    preflight.isMessageForUs.mockReturnValue(false)
    const { default: setup } = await import('./listeners')
    setup()
    const listener = addEventListener.mock.calls.find((c) => c[0] === window)[2]
    listener({ data: 'not-ours' })

    expect(consoleEvent).toHaveBeenCalled()
    expect(debug).toHaveBeenCalled()
  })

  test('throws when settings missing for id', async () => {
    const decode = (await import('./received/decode')).default
    decode.mockReturnValue({ id: 'nope', type: 'PING' })
    preflight.isMessageForUs.mockReturnValue(true)
    preflight.checkIframeExists.mockReturnValue(true)
    preflight.isMessageFromMetaParent.mockReturnValue(false)
    preflight.isMessageFromIframe.mockReturnValue(true)

    const { default: setup } = await import('./listeners')
    setup()
    const listener = addEventListener.mock.calls.find((c) => c[0] === window)[2]

    expect(() => listener({ data: '[iFrameSizer]x' })).toThrow(
      /No settings for nope/,
    )
  })

  test('routes known message and updates lastMessage', async () => {
    const decode = (await import('./received/decode')).default
    decode.mockReturnValue({ id: 'abc', type: 'INIT' })

    const settingsMod = await import('./values/settings')
    const s = {}
    settingsMod.default.abc = s

    const { default: setup } = await import('./listeners')
    setup()
    const listener = addEventListener.mock.calls.find((c) => c[0] === window)[2]
    const evt = { data: '[iFrameSizer]payload' }
    listener(evt)

    expect(s.lastMessage).toBe(evt.data)
    expect(routeMessage).toHaveBeenCalledWith({ id: 'abc', type: 'INIT' })
  })

  test('returns early when not from iframe', async () => {
    const decode = (await import('./received/decode')).default
    decode.mockReturnValue({ id: 'abc', type: 'INIT' })
    preflight.isMessageForUs.mockReturnValue(true)
    preflight.checkIframeExists.mockReturnValue(true)
    preflight.isMessageFromMetaParent.mockReturnValue(false)
    preflight.isMessageFromIframe.mockReturnValue(false)

    const settingsMod = await import('./values/settings')
    settingsMod.default.abc = {}

    const { default: setup } = await import('./listeners')
    setup()
    const listener = addEventListener.mock.calls.find((c) => c[0] === window)[2]
    listener({ data: '[iFrameSizer]x' })

    expect(routeMessage).not.toHaveBeenCalled()
  })

  test('returns early when message is not a string and not for us', async () => {
    preflight.isMessageForUs.mockReturnValue(false)
    const { default: setup } = await import('./listeners')
    setup()
    const listener = addEventListener.mock.calls.find((c) => c[0] === window)[2]
    listener({ data: { some: 'object' } })

    expect(consoleEvent).not.toHaveBeenCalled()
    expect(debug).not.toHaveBeenCalled()
  })

  test('returns early when iframe does not exist', async () => {
    const decode = (await import('./received/decode')).default
    decode.mockReturnValue({ id: 'abc', type: 'INIT' })
    preflight.checkIframeExists.mockReturnValue(false)

    const settingsMod = await import('./values/settings')
    settingsMod.default.abc = {}

    const { default: setup } = await import('./listeners')
    setup()
    const listener = addEventListener.mock.calls.find((c) => c[0] === window)[2]
    listener({ data: '[iFrameSizer]x' })

    expect(routeMessage).not.toHaveBeenCalled()
  })

  test('returns early when message is from meta parent', async () => {
    const decode = (await import('./received/decode')).default
    decode.mockReturnValue({ id: 'abc', type: 'INIT' })
    preflight.checkIframeExists.mockReturnValue(true)
    preflight.isMessageFromMetaParent.mockReturnValue(true)

    const settingsMod = await import('./values/settings')
    settingsMod.default.abc = {}

    const { default: setup } = await import('./listeners')
    setup()
    const listener = addEventListener.mock.calls.find((c) => c[0] === window)[2]
    listener({ data: '[iFrameSizer]x' })

    expect(routeMessage).not.toHaveBeenCalled()
  })

  test('iframeParentListener handles the message in a microtask, not a timer', async () => {
    // Timers are faked and never run: only a microtask can deliver it
    vi.useFakeTimers()

    const decode = (await import('./received/decode')).default
    decode.mockReturnValue({ id: 'abc', type: 'INIT' })
    preflight.isMessageForUs.mockReturnValue(true)
    preflight.checkIframeExists.mockReturnValue(true)
    preflight.isMessageFromMetaParent.mockReturnValue(false)
    preflight.isMessageFromIframe.mockReturnValue(true)

    const settingsMod = await import('./values/settings')
    settingsMod.default.abc = {}

    const { default: setup } = await import('./listeners')
    setup()

    window.iframeParentListener('[iFrameSizer]test')

    // Not inside the child's call...
    expect(routeMessage).not.toHaveBeenCalled()

    // ...but as soon as it has finished, without waiting for a task
    await Promise.resolve()

    expect(routeMessage).toHaveBeenCalledWith({ id: 'abc', type: 'INIT' })

    vi.useRealTimers()
  })

  async function listenForWidth(iframeSettings) {
    const decode = (await import('./received/decode')).default
    decode.mockReturnValue({ id: 'wide', type: 'resizeObserver' })
    preflight.isMessageForUs.mockReturnValue(true)
    preflight.checkIframeExists.mockReturnValue(true)
    preflight.isMessageFromMetaParent.mockReturnValue(false)
    preflight.isMessageFromIframe.mockReturnValue(true)

    const settingsMod = await import('./values/settings')
    settingsMod.default.wide = { sizeWidth: true, ...iframeSettings }

    const { default: setup } = await import('./listeners')
    setup()

    window.iframeParentListener('[iFrameSizer]wide:100:200:resizeObserver')
  }

  test('iframeParentListener uses a microtask when a v6 child sizes its page to its content', async () => {
    vi.useFakeTimers()
    await listenForWidth({ maxContentWidth: true, childVersion: '6.0.0' })

    await Promise.resolve()
    expect(routeMessage).toHaveBeenCalledWith({
      id: 'wide',
      type: 'resizeObserver',
    })

    vi.useRealTimers()
  })

  test('iframeParentListener waits for a timer with a legacy width direction', async () => {
    vi.useFakeTimers()
    await listenForWidth({ maxContentWidth: false, childVersion: '6.0.0' })

    // A microtask is not enough: the child's body follows the iframe width
    await Promise.resolve()
    expect(routeMessage).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(routeMessage).toHaveBeenCalled()

    vi.useRealTimers()
  })

  test('iframeParentListener waits for a timer until the child is known to be v6', async () => {
    vi.useFakeTimers()
    await listenForWidth({ maxContentWidth: true })

    await Promise.resolve()
    expect(routeMessage).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(routeMessage).toHaveBeenCalled()

    vi.useRealTimers()
  })

  test('sets up listeners for visibilitychange event', async () => {
    const { default: setup } = await import('./listeners')
    setup()

    // Check that visibilitychange listener was added
    const visibilityCall = addEventListener.mock.calls.find(
      (c) => c[0] === document && c[1] === 'visibilitychange',
    )
    expect(visibilityCall).toBeDefined()
  })
})
