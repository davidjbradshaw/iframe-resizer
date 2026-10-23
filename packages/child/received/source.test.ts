import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))

const { default: isMessageFromParent } = await import('./source')
const { log } = await import('../console')
const state = (await import('../values/state')).default

const parentWindow = {} as Window
const otherWindow = {} as Window
const DATA = '[iFrameSizer]resize'

const from = (source: Window | null) => ({ data: DATA, source }) as MessageEvent

// What window.iframeChildListener passes on from a same-origin parent
const direct = { data: DATA, sameOrigin: true as const }

describe('child/received/source', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.firstRun = false
    state.target = parentWindow
    state.testHarness = false
  })

  test('accepts a message from the window that sent init', () => {
    expect(isMessageFromParent(from(parentWindow), 'resize')).toBe(true)
    expect(log).not.toHaveBeenCalled()
  })

  test('ignores a message from any other window, and only logs it', () => {
    expect(isMessageFromParent(from(otherWindow), 'resize')).toBe(false)
    expect(isMessageFromParent(from(null), 'message')).toBe(false)

    expect(log).toHaveBeenCalledTimes(2)
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('not from the parent page'),
      expect.anything(),
    )
  })

  test('ignores a second init from another window', () => {
    expect(isMessageFromParent(from(otherWindow), 'init')).toBe(false)
  })

  test('accepts a message passed directly by a same-origin parent', () => {
    expect(isMessageFromParent(direct, 'resize')).toBe(true)
    expect(log).not.toHaveBeenCalled()
  })

  test('accepts the placeholder windows of the Karma specs', () => {
    state.testHarness = true

    expect(isMessageFromParent(from(otherWindow), 'resize')).toBe(true)
  })

  describe('before init', () => {
    beforeEach(() => {
      state.firstRun = true
    })

    test('accepts init, which checks the window itself', () => {
      expect(isMessageFromParent(from(otherWindow), 'init')).toBe(true)
      expect(log).not.toHaveBeenCalled()
    })

    test('ignores every other message, whichever window sent it', () => {
      state.testHarness = true

      expect(isMessageFromParent(from(parentWindow), 'resize')).toBe(false)
      expect(isMessageFromParent(from(otherWindow), 'message')).toBe(false)
      expect(isMessageFromParent(direct, 'update')).toBe(false)

      expect(log).toHaveBeenCalledTimes(3)
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('before init'),
        expect.anything(),
      )
    })
  })
})
