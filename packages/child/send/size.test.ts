import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.useFakeTimers()

vi.mock('../console', () => ({
  debug: vi.fn(),
  endAutoGroup: vi.fn(),
  errorBoundary: (fn) => fn,
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  purge: vi.fn(),
}))
vi.mock('../size/content', () => ({
  default: vi.fn(() => ({ height: 10, width: 20 })),
}))
vi.mock('../values/settings', () => ({ default: { autoResize: true } }))
vi.mock('../values/state', () => ({
  default: {
    isHidden: false,
    timerActive: false,
    totalTime: 0,
    sameOrigin: false,
  },
}))
vi.mock('./dispatch', () => ({ default: vi.fn() }))

const consoleMod = await import('../console')
const getContentSize = (await import('../size/content')).default
const settings = (await import('../values/settings')).default
const state = (await import('../values/state')).default
const dispatch = (await import('./dispatch')).default
const sendSize = (await import('./size')).default
const { OVERFLOW_OBSERVER, MANUAL_RESIZE_REQUEST } =
  await import('../../common/consts')

describe('child/send/size', () => {
  const origRAF = globalThis.requestAnimationFrame
  const origCAF = globalThis.cancelAnimationFrame

  beforeEach(() => {
    vi.clearAllMocks()
    settings.autoResize = true
    state.isHidden = false
    globalThis.requestAnimationFrame = (cb) => {
      cb()
      return 1
    }
    globalThis.cancelAnimationFrame = vi.fn()
    // run any queued raf when timers run
    vi.spyOn(consoleMod, 'event')
    vi.spyOn(consoleMod, 'debug')
  })

  test('skips non-manual resize when hidden and cancels raf', () => {
    state.isHidden = true
    sendSize('evt', 'desc')

    expect(consoleMod.log).toHaveBeenCalled()
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  test('manual resize bypasses hidden check and dispatches', () => {
    state.isHidden = true
    sendSize(MANUAL_RESIZE_REQUEST, 'manual resize', 10, 20)

    expect(dispatch).toHaveBeenCalledWith(10, 20, MANUAL_RESIZE_REQUEST, undefined)
  })

  test('skips log when already hidden and message already shown', () => {
    // First ensure hiddenMessageShown is reset by going through default path
    state.isHidden = false
    sendSize('reset', 'reset')
    vi.clearAllMocks()

    // Now test the hidden path
    state.isHidden = true

    // First call when hidden sets hiddenMessageShown and logs
    sendSize('evt1', 'desc1')
    expect(consoleMod.log).toHaveBeenCalledWith(
      'Iframe hidden - Ignored resize request',
    )
    vi.clearAllMocks()

    // Second call when still hidden skips log (hiddenMessageShown already true)
    sendSize('evt2', 'desc2')
    expect(consoleMod.log).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  test('ignores when sendPending true for non-overflow triggers', () => {
    const orig = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = () => 1 // do not flush pending
    sendSize('evt', 'd')
    sendSize('evt', 'd')
    globalThis.requestAnimationFrame = orig

    expect(consoleMod.log).toHaveBeenCalledWith(
      'Resize already pending - Ignored resize request',
    )
  })

  test('respects autoResize=false except for allowed events', () => {
    // ensure pending reset and clean mocks
    settings.autoResize = true
    sendSize('prime', 'x')
    vi.clearAllMocks()
    settings.autoResize = false
    sendSize('some-evt', 'd')

    expect(dispatch).not.toHaveBeenCalled()

    // OVERFLOW_OBSERVER does NOT bypass autoResize=false (only manual/parent resize allowed)
    settings.autoResize = false
    sendSize(OVERFLOW_OBSERVER, 'Overflow updated')

    expect(getContentSize).not.toHaveBeenCalled()
  })

  test('default path calls getContentSize and dispatch, then resets pending in raf', () => {
    sendSize('evt', 'd')

    expect(getContentSize).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(10, 20, 'evt', undefined)
    vi.runAllTimers()

    expect(consoleMod.event).toHaveBeenCalledWith('requestAnimationFrame')
    expect(consoleMod.debug).toHaveBeenCalled()
  })

  test('does not call dispatch when getContentSize returns null', () => {
    getContentSize.mockReturnValueOnce(null)
    sendSize('evt', 'd')

    expect(getContentSize).toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  test('does not create new raf when rafId already exists', () => {
    let rafCallCount = 0
    // Override RAF to NOT execute callback immediately, so rafId persists
    // Using 999 as a unique RAF ID that won't conflict with actual RAF calls
    const rafSpy = vi.fn(() => {
      rafCallCount++
      return 999
    })
    globalThis.requestAnimationFrame = rafSpy

    // First call creates rafId and doesn't execute callback
    sendSize('evt1', 'd1')
    expect(rafCallCount).toBe(1)

    // Second call with MANUAL_RESIZE_REQUEST bypasses sendPending check
    // and should reach line 76, but skip creating new raf since rafId exists
    sendSize(MANUAL_RESIZE_REQUEST, 'd2')
    expect(rafCallCount).toBe(1) // Still only 1 RAF created
    expect(rafSpy).toHaveBeenCalledTimes(1)
  })

  test('passes msg parameter through to dispatch', () => {
    const customMsg = 'custom message'
    sendSize('evt', 'd', undefined, undefined, customMsg)

    expect(dispatch).toHaveBeenCalledWith(10, 20, 'evt', customMsg)
  })

  afterEach(() => {
    // Reset internal sendPending/rafId by triggering hidden path
    state.isHidden = true
    try {
      sendSize('cleanup', 'c')
    } catch (error) {
      // noop
    }
    state.isHidden = false
    vi.clearAllMocks()
  })

  // restore
  afterAll(() => {
    globalThis.requestAnimationFrame = origRAF
    globalThis.cancelAnimationFrame = origCAF
  })
})
