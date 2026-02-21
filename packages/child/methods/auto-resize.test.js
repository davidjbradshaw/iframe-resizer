import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../../common/utils', () => ({ typeAssert: vi.fn() }))
vi.mock('../console', () => ({ advise: vi.fn(), event: vi.fn() }))
vi.mock('../send/message', () => ({ default: vi.fn() }))
vi.mock('../send/size', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { autoResize: false, calculateHeight: true, calculateWidth: false },
}))

const { advise, event: consoleEvent } = await import('../console')
const sendMessage = (await import('../send/message')).default
const sendSize = (await import('../send/size')).default
const settings = (await import('../values/settings')).default
const { AUTO_RESIZE, ENABLE } = await import('../../common/consts')
const autoResize = (await import('./auto-resize')).default

describe('child/methods/auto-resize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    settings.autoResize = false
    settings.calculateHeight = true
    settings.calculateWidth = false
  })

  test('returns false and advises when both calc flags are false', () => {
    settings.calculateHeight = false
    settings.calculateWidth = false
    const res = autoResize(true)

    expect(res).toBe(false)
    expect(consoleEvent).toHaveBeenCalledWith(ENABLE)
    expect(advise).toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  test('enables autoResize and queues sendSize; always sends AUTO_RESIZE message', async () => {
    const out = autoResize(true)

    expect(out).toBe(true)
    expect(settings.autoResize).toBe(true)
    // flush microtask queue
    await Promise.resolve()

    expect(sendSize).toHaveBeenCalledWith(ENABLE, 'Auto Resize enabled')
    expect(sendMessage).toHaveBeenCalledWith(0, 0, AUTO_RESIZE, 'true')
  })

  test('disables autoResize from true', () => {
    settings.autoResize = true
    const out = autoResize(false)

    expect(out).toBe(false)
    expect(settings.autoResize).toBe(false)
    expect(sendMessage).toHaveBeenCalledWith(0, 0, AUTO_RESIZE, 'false')
  })

  test('no-op when disabling already-disabled autoResize', () => {
    settings.autoResize = false
    const out = autoResize(false)

    expect(out).toBe(false)
    expect(settings.autoResize).toBe(false)
    expect(sendSize).not.toHaveBeenCalled()
    expect(sendMessage).toHaveBeenCalledWith(0, 0, AUTO_RESIZE, 'false')
  })
})
