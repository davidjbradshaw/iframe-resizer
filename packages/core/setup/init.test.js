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
const { INIT, INIT_FROM_IFRAME } = await import('../../common/consts')

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
    expect(addEventListener).toHaveBeenCalledWith(
      iframe,
      'load',
      expect.any(Function),
    )

    // send init path
    vi.runOnlyPendingTimers()

    expect(trigger).toHaveBeenCalledWith(INIT, 'msg', 'if2')
    expect(warnOnNoResponse).toHaveBeenCalledWith('if2', settings)

    // manual call of iframe-originated init
    settings.if2.initChild()

    expect(trigger).toHaveBeenCalledWith(INIT_FROM_IFRAME, 'msg', 'if2')

    // simulate onload (we only assert listener was registered above; internal timer behavior is implementation detail)
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
})
