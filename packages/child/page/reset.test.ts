import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.useFakeTimers()

vi.mock('../console', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  purge: vi.fn(),
}))
vi.mock('../send/message', () => ({ default: vi.fn() }))
vi.mock('../size/get-height', () => ({
  default: { enabled: () => true, auto: vi.fn(() => 800) },
}))
vi.mock('../size/get-width', () => ({
  default: { enabled: () => false, scroll: vi.fn(() => 20) },
}))
vi.mock('../values/settings', () => ({
  default: {
    calculateHeight: true,
    calculateWidth: false,
    heightCalcMode: 'auto',
    onBeforeResize: undefined,
    tolerance: 0,
    widthCalcMode: 'scroll',
  },
}))

const { resetIframe, triggerReset } = await import('./reset')
const sendMessage = (await import('../send/message')).default
const consoleMod = await import('../console')
const settings = (await import('../values/settings')).default
const state = (await import('../values/state')).default

describe('child/page/reset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    settings.onBeforeResize = undefined
    state.height = 0
    state.width = 0
    state.triggerLocked = false
  })

  test('triggerReset sends the measured size and stores it', () => {
    triggerReset('resetPage')

    expect(sendMessage).toHaveBeenCalledWith(800, 20, 'resetPage')
    expect(state.height).toBe(800)
    expect(state.width).toBe(20)
    expect(consoleMod.log).toHaveBeenCalledWith(
      'Reset trigger event: %cresetPage',
      expect.any(String),
    )
  })

  test('triggerReset applies onBeforeResize', () => {
    settings.onBeforeResize = vi.fn((size: number) => Math.min(size, 500))

    triggerReset('resetPage')

    expect(settings.onBeforeResize).toHaveBeenCalledWith(
      800,
      'resetPage',
      'height',
    )
    expect(sendMessage).toHaveBeenCalledWith(500, 20, 'resetPage')
    expect(state.height).toBe(500)
  })

  test('triggerReset sends even when the size has not changed', () => {
    state.height = 800
    state.width = 20

    triggerReset('resetPage')

    expect(sendMessage).toHaveBeenCalledWith(800, 20, 'resetPage')
  })

  test('resetIframe locks trigger and resets calc mode temporarily', () => {
    const raf = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = (cb) => {
      cb()
      return 1
    }
    // Only the default mode is mocked, so this measures only if it is used
    settings.heightCalcMode = 'max'
    resetIframe('desc')

    expect(state.triggerLocked).toBe(false)
    expect(sendMessage).toHaveBeenCalledWith(800, 20, 'reset')
    expect(settings.heightCalcMode).toBe('max')
    settings.heightCalcMode = 'auto'
    globalThis.requestAnimationFrame = raf
  })

  test('lockTrigger blocks calculation when already locked', () => {
    state.triggerLocked = true

    resetIframe('blocked-test')

    // Should log the blocked message
    expect(consoleMod.log).toHaveBeenCalledWith(
      'TriggerLock blocked calculation',
    )
  })
})
