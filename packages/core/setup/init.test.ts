import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.useFakeTimers()

vi.mock('../../common/listeners', () => ({ addEventListener: vi.fn() }))
vi.mock('../console', () => ({ event: vi.fn(), info: vi.fn() }))
vi.mock('../methods/reset', () => ({ default: vi.fn() }))
vi.mock('../send/timeout', () => ({ default: vi.fn() }))
vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: {} }))

const { addEventListener } = await import('../../common/listeners')
const { event: consoleEvent, info } = await import('../console')
const resetIframe = (await import('../methods/reset')).default
const warnOnNoResponse = (await import('../send/timeout')).default
const trigger = (await import('../send/trigger')).default
const settings = (await import('../values/settings')).default
const init = (await import('./init')).default
const { INIT, INIT_FROM_IFRAME, ONLOAD } = await import('../../common/consts')

describe('core/setup/init', () => {
  beforeEach(() => {
    for (const k of Object.keys(settings)) delete settings[k]
  })

  test('delays when no content and emits noContent event', () => {
    settings.if1 = { iframe: { loading: 'eager', src: '', srcdoc: '' } }
    init('if1', 'm')
    vi.runAllTimers()

    expect(consoleEvent).toHaveBeenCalledWith('if1', 'noContent')
    expect(info).toHaveBeenCalled()
  })

  test('creates initChild for INIT and INIT_FROM_IFRAME; onload listener registered', () => {
    const iframe = { loading: 'eager', src: 'x', srcdoc: '' }
    settings.if2 = { iframe, firstRun: false }
    init('if2', 'msg')

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
      iframe: { loading: 'eager', src: 'x' },
      firstRun: false,
      heightCalculationMethod: 'max',
    }
    init('if3', 'z')
    vi.runAllTimers()
    // allow checkReset evaluation after INIT path
    expect(resetIframe).toHaveBeenCalled()
  })

  test('does not send init when waitForLoad is true', () => {
    settings.if4 = {
      iframe: { loading: 'eager', src: 'x' },
      waitForLoad: true,
    }

    const triggerCallsBefore = trigger.mock.calls.length
    init('if4', 'msg')
    vi.runAllTimers()

    // trigger should not be called for INIT path (only initChild and onload setups)
    expect(trigger.mock.calls.length).toBe(triggerCallsBefore)
  })

  test('does not warn on no response for lazy loading iframe on INIT', () => {
    settings.if5 = {
      iframe: { loading: 'lazy', src: 'x' },
      firstRun: true,
    }

    const warnCallsBefore = warnOnNoResponse.mock.calls.length
    init('if5', 'msg')
    vi.runAllTimers()

    // warnOnNoResponse should be called for INIT, but would not be called if lazy check works
    // Actually, looking at the code, it only skips for isInit(eventType) && isLazy(iframe)
    // Since we're running timers, INIT path runs, and the condition checks eventType === INIT
    // So warnOnNoResponse should NOT be called
    expect(warnOnNoResponse.mock.calls.length).toBe(warnCallsBefore)
  })

  test('handles iframe removed before load event gracefully', () => {
    settings.if6 = {
      iframe: { loading: 'eager', src: 'x' },
      firstRun: true,
    }
    init('if6', 'msg')

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
})
