import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.useFakeTimers()

vi.mock('../../common/listeners', () => ({ addEventListener: vi.fn() }))
vi.mock('../console', () => ({ event: vi.fn(), info: vi.fn(), warn: vi.fn() }))
vi.mock('../methods/reset', () => ({ default: vi.fn() }))
vi.mock('../send/outgoing', () => ({ default: vi.fn(() => 'msg') }))
vi.mock('../send/timeout', () => ({ default: vi.fn() }))
vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: {} }))

const { addEventListener } = await import('../../common/listeners')
const { event: consoleEvent, info, warn } = await import('../console')
const resetIframe = (await import('../methods/reset')).default
const createOutgoingMessage = (await import('../send/outgoing')).default
const warnOnNoResponse = (await import('../send/timeout')).default
const trigger = (await import('../send/trigger')).default
const createOutgoingMessage = (await import('../send/outgoing')).default
const settings = (await import('../values/settings')).default
const { default: init, setInitMessage } = await import('./init')
const { INIT, INIT_FROM_IFRAME, ONLOAD } =
  await import('@iframe-resizer/common/consts')

describe('core/setup/init', () => {
  beforeEach(() => {
    for (const k of Object.keys(settings)) delete settings[k]
  })

  test('delays when no content and emits noContent event', () => {
    settings.if1 = {
      iframe: { isConnected: true, loading: 'eager', src: '', srcdoc: '' },
    }
    init('if1')
    vi.runAllTimers()

    expect(consoleEvent).toHaveBeenCalledWith('if1', 'noContent')
    expect(info).toHaveBeenCalled()
  })

  test('sends the init message built from the settings at setup', () => {
    settings.if11 = {
      iframe: { isConnected: true, loading: 'eager', src: 'x' },
      firstRun: true,
    }
    init('if11')
    vi.runAllTimers()

    expect(createOutgoingMessage).toHaveBeenCalledWith('if11')
    expect(trigger).toHaveBeenCalledWith(INIT, 'msg', 'if11')
  })

  test('sends the init message as refreshed after the options changed', () => {
    const iframe = { isConnected: true, loading: 'eager', src: 'x' }
    settings.if12 = { iframe, firstRun: true }
    init('if12')

    // An update before the child replies rebuilds the message
    vi.mocked(createOutgoingMessage).mockReturnValueOnce('updated')
    setInitMessage('if12')
    vi.runAllTimers()

    expect(trigger).toHaveBeenCalledWith(INIT, 'updated', 'if12')

    // And every later init, such as a page loading in the iframe, uses it
    settings.if12.initChild()
    expect(trigger).toHaveBeenCalledWith(INIT_FROM_IFRAME, 'updated', 'if12')
  })

  test('creates initChild for INIT and INIT_FROM_IFRAME; onload listener registered', () => {
    const iframe = { isConnected: true, loading: 'eager', src: 'x', srcdoc: '' }
    settings.if2 = { iframe, firstRun: false }
    init('if2')

    // onload listener registered
    const onloadCall = addEventListener.mock.calls.find(
      (call) => call[0] === iframe && call[1] === 'load',
    )
    expect(onloadCall).toBeDefined()
    const onloadHandler = onloadCall[2]

    // send init path
    vi.runOnlyPendingTimers()

    expect(trigger).toHaveBeenCalledWith(INIT, 'msg', 'if2')
    expect(warnOnNoResponse).toHaveBeenCalledWith('if2', settings)

    // manual call of iframe-originated init
    settings.if2.initChild()

    expect(trigger).toHaveBeenCalledWith(INIT_FROM_IFRAME, 'msg', 'if2')

    // simulate onload - invoke the registered handler
    onloadHandler()
    vi.runAllTimers()
    // The onload handler should trigger ONLOAD event
    expect(trigger).toHaveBeenCalledWith(ONLOAD, 'msg', 'if2')
  })

  test('checkReset triggers reset for specific methods when not firstRun', () => {
    settings.if3 = {
      iframe: { isConnected: true, loading: 'eager', src: 'x' },
      firstRun: false,
      heightCalculationMethod: 'max',
    }
    init('if3')
    vi.runAllTimers()
    // allow checkReset evaluation after INIT path
    expect(resetIframe).toHaveBeenCalled()
  })

  test('does not send init when waitForLoad is true', () => {
    settings.if4 = {
      iframe: { isConnected: true, loading: 'eager', src: 'x' },
      waitForLoad: true,
    }

    const triggerCallsBefore = trigger.mock.calls.length
    init('if4')
    vi.runAllTimers()

    // trigger should not be called for INIT path (only initChild and onload setups)
    expect(trigger.mock.calls.length).toBe(triggerCallsBefore)
  })

  test('does not warn on no response for lazy loading iframe on INIT', () => {
    settings.if5 = {
      iframe: { isConnected: true, loading: 'lazy', src: 'x' },
      firstRun: true,
    }

    const warnCallsBefore = warnOnNoResponse.mock.calls.length
    init('if5')
    vi.runAllTimers()

    // warnOnNoResponse should be called for INIT, but would not be called if lazy check works
    // Actually, looking at the code, it only skips for isInit(eventType) && isLazy(iframe)
    // Since we're running timers, INIT path runs, and the condition checks eventType === INIT
    // So warnOnNoResponse should NOT be called
    expect(warnOnNoResponse.mock.calls.length).toBe(warnCallsBefore)
  })

  test('leaves the first init to the load event while the iframe is not in the document', () => {
    const iframe = { isConnected: false, loading: 'eager', src: 'x' }
    settings.if10 = { iframe, firstRun: true }

    const triggerCallsBefore = trigger.mock.calls.length
    const warnCallsBefore = warnOnNoResponse.mock.calls.length
    init('if10')
    vi.runAllTimers()

    expect(consoleEvent).toHaveBeenCalledWith('if10', 'notInDocument')
    expect(info).toHaveBeenCalledWith(
      'if10',
      expect.stringContaining('not in the document'),
    )
    expect(trigger.mock.calls.length).toBe(triggerCallsBefore)
    expect(warnOnNoResponse.mock.calls.length).toBe(warnCallsBefore)

    // Added to the page and loaded
    iframe.isConnected = true
    addEventListener.mock.calls.find(
      (call) => call[0] === iframe && call[1] === 'load',
    )[2]()
    vi.runAllTimers()

    expect(trigger).toHaveBeenCalledWith(ONLOAD, 'msg', 'if10')
    expect(warnOnNoResponse).toHaveBeenCalledWith('if10', settings)
  })

  test('takes the remote host from a src set after bind when the iframe loads', () => {
    const iframe = { isConnected: true, loading: 'eager', src: '', srcdoc: '' }
    settings.if7 = { iframe, checkOrigin: true, firstRun: true }
    init('if7')
    vi.runAllTimers()

    expect(settings.if7.remoteHost).toBeUndefined()

    const onloadHandler = addEventListener.mock.calls.find(
      (call) => call[0] === iframe && call[1] === 'load',
    )[2]
    iframe.src = 'https://later.example/page.html'
    onloadHandler()
    vi.runAllTimers()

    expect(settings.if7.remoteHost).toBe('https://later.example')
    expect(settings.if7.targetOrigin).toEqual(['https://later.example'])
    expect(trigger).toHaveBeenCalledWith(ONLOAD, 'msg', 'if7')
  })

  test('takes the remote host from the current src when the child says it is ready', () => {
    const iframe = {
      isConnected: true,
      loading: 'eager',
      src: 'https://first.example/a.html',
    }
    settings.if8 = {
      iframe,
      checkOrigin: true,
      firstRun: true,
      remoteHost: 'https://first.example',
      targetOrigin: ['https://first.example'],
    }
    init('if8')
    vi.runAllTimers()

    iframe.src = 'https://second.example/b.html'
    settings.if8.initChild()

    expect(settings.if8.remoteHost).toBe('https://second.example')
    expect(settings.if8.targetOrigin).toEqual(['https://second.example'])
    expect(trigger).toHaveBeenLastCalledWith(INIT_FROM_IFRAME, 'msg', 'if8')
  })

  test('does not repeat the empty checkOrigin warning when the src is unchanged', () => {
    settings.if9 = {
      iframe: {
        isConnected: true,
        loading: 'eager',
        src: 'https://same.example/a.html',
      },
      checkOrigin: [],
      firstRun: true,
      remoteHost: 'https://same.example',
      targetOrigin: [],
    }
    init('if9')
    vi.runAllTimers()
    settings.if9.initChild()

    expect(warn).not.toHaveBeenCalled()
    expect(settings.if9.targetOrigin).toEqual([])
  })

  test('handles iframe removed before load event gracefully', () => {
    settings.if6 = {
      iframe: { isConnected: true, loading: 'eager', src: 'x' },
      firstRun: true,
    }
    init('if6')

    // Save initChild reference before deleting settings
    const { initChild } = settings.if6
    expect(initChild).toBeDefined()

    const triggerCallsBefore = trigger.mock.calls.length

    // Remove settings to simulate iframe removal
    delete settings.if6

    // Call initChild after removal — should return early without triggering
    initChild()
    vi.runAllTimers()

    expect(trigger.mock.calls.length).toBe(triggerCallsBefore)
  })

  test('builds each init from the options as they are when it is sent', () => {
    const iframe = { isConnected: true, loading: 'eager', src: 'x', srcdoc: '' }
    settings.ifOpts = { iframe, firstRun: false, tolerance: 0 }
    createOutgoingMessage.mockImplementation(
      (id) => `msg:${settings[id].tolerance}`,
    )
    init('ifOpts')
    vi.runAllTimers()
    expect(trigger).toHaveBeenLastCalledWith(INIT, 'msg:0', 'ifOpts')

    // An options update, then the page in the iframe reloads
    settings.ifOpts.tolerance = 5
    const onloadHandler = addEventListener.mock.calls.findLast(
      (call) => call[0] === iframe && call[1] === 'load',
    )[2]
    onloadHandler()
    vi.runAllTimers()

    expect(trigger).toHaveBeenLastCalledWith(ONLOAD, 'msg:5', 'ifOpts')
    createOutgoingMessage.mockImplementation(() => 'msg')
  })
})
