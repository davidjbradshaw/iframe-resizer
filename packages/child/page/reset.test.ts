import { describe, expect, test, vi } from 'vitest'

vi.useFakeTimers()

vi.mock('../console', () => ({ event: vi.fn(), log: vi.fn() }))
vi.mock('../send/message', () => ({ default: vi.fn() }))
vi.mock('../size', () => ({
  getHeight: { auto: vi.fn(() => 10) },
  getWidth: { scroll: vi.fn(() => 20) },
}))
vi.mock('../values/settings', () => ({
  default: { heightCalcMode: 'auto', widthCalcMode: 'scroll' },
}))
vi.mock('../values/state', () => ({ default: { triggerLocked: false } }))

const { resetIframe, triggerReset } = await import('./reset')
const sendMessage = (await import('../send/message')).default
const consoleMod = await import('../console')
const state = (await import('../values/state')).default

describe('child/page/reset', () => {
  test('triggerReset computes size and sends message', () => {
    triggerReset('evt')

    expect(sendMessage).toHaveBeenCalledWith(10, 20, 'evt')
    expect(consoleMod.log).toHaveBeenCalled()
  })

  test('resetIframe locks trigger and resets calc mode temporarily', () => {
    const raf = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = (cb) => {
      cb()
      return 1
    }
    resetIframe('desc')

    expect(state.triggerLocked).toBe(false)
    expect(sendMessage).toHaveBeenCalledWith(10, 20, 'reset')

    // The lock coming off is the only thing in its frame, so it names its own
    // group, and logs rather than debugs so the group is not empty
    expect(consoleMod.event).toHaveBeenCalledWith('eventLock')
    expect(consoleMod.log).toHaveBeenCalledWith('Trigger event lock off')
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
