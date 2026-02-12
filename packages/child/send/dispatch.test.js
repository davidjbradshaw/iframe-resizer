import { beforeEach, describe, expect, test, vi } from 'vitest'

import { INIT } from '../../common/consts'

vi.mock('../../common/mode', () => ({ getModeData: vi.fn(() => 'msg') }))
vi.mock('../console', () => ({ advise: vi.fn(), info: vi.fn(), log: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { parentId: 'pid', mode: 0, targetOrigin: 'https://p' },
}))
vi.mock('../values/state', () => ({
  default: {
    sameOrigin: false,
    target: { postMessage: vi.fn() },
    timerActive: false,
    totalTime: 0,
  },
}))

const { advise, info, log } = await import('../console')
const settings = (await import('../values/settings')).default
const state = (await import('../values/state')).default
const { displayTimeTaken, setTargetOrigin, dispatchToParent } =
  await import('./dispatch')
const dispatch = (await import('./dispatch')).default

describe('child/send/dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.sameOrigin = false
    state.target = { postMessage: vi.fn() }
    settings.mode = 0
  })

  test('setTargetOrigin logs override and returns it', () => {
    const v = setTargetOrigin('https://x')

    expect(v).toBe('https://x')
    expect(log).toHaveBeenCalled()
  })

  test('dispatchToParent uses postMessage when cross-origin', () => {
    const ok = dispatchToParent('m', 'https://x')

    expect(ok).toBe(true)
    expect(state.target.postMessage).toHaveBeenCalled()
  })

  test('dispatchToParent sameOrigin path and mode=1 swallows error via advise', () => {
    state.sameOrigin = true
    settings.mode = 1
    globalThis.parent = {
      iframeParentListener: () => {
        throw new Error('x')
      },
    }
    const ok = dispatchToParent('x')

    expect(ok).toBe(false)
    expect(advise).toHaveBeenCalled()
  })

  test('default dispatch builds message and logs', () => {
    dispatch(100, 200, 'evt', 'msg')

    expect(info).toHaveBeenCalled()
  })

  test('displayTimeTaken logs timing when active', () => {
    state.timerActive = true
    state.totalTime = performance.now() - 5
    displayTimeTaken('evt')

    expect(log).toHaveBeenCalled()
  })

  test('displayTimeTaken logs INIT message for init event', () => {
    state.timerActive = true
    state.totalTime = performance.now() - 5
    displayTimeTaken(INIT)

    expect(log).toHaveBeenCalled()
    expect(log.mock.calls[0][0]).toContain('Initialised iframe')
  })

  test('dispatchToParent sameOrigin path with mode !== 1 throws error', () => {
    state.sameOrigin = true
    settings.mode = 0
    globalThis.parent = {
      iframeParentListener: () => {
        throw new Error('test error')
      },
    }

    expect(() => dispatchToParent('x')).toThrow('test error')
  })

  test('dispatch with undefined msg omits message suffix', () => {
    dispatch(100, 200, 'evt')

    expect(state.target.postMessage).toHaveBeenCalled()
    const message = state.target.postMessage.mock.calls[0][0]
    expect(message).not.toContain('::')
    expect(message).toMatch(/pid:100:200:evt$/)
  })

  test('dispatch with msg includes message suffix', () => {
    dispatch(100, 200, 'evt', 'custom')

    expect(state.target.postMessage).toHaveBeenCalled()
    const message = state.target.postMessage.mock.calls[0][0]
    expect(message).toContain(':custom')
  })

  test('dispatch returns early when mode < -1', () => {
    settings.mode = -2

    dispatch(100, 200, 'evt', 'msg')

    expect(state.target.postMessage).not.toHaveBeenCalled()
    expect(info).not.toHaveBeenCalled()
  })

  test('dispatch returns early when dispatchToParent fails', () => {
    state.sameOrigin = true
    settings.mode = 1
    globalThis.parent = {
      iframeParentListener: () => {
        throw new Error('fail')
      },
    }

    dispatch(100, 200, 'evt', 'msg')

    // sendFailed() uses once() so advise may not be called if already invoked
    // The important behavior is that info is not called (early return)
    expect(info).not.toHaveBeenCalled()
  })

  test('dispatch logs sameOrigin when using same origin', () => {
    state.sameOrigin = true
    globalThis.parent = {
      iframeParentListener: vi.fn(),
    }

    dispatch(100, 200, 'evt', 'msg')

    expect(info).toHaveBeenCalled()
    expect(info.mock.calls[0][0]).toContain('sameOrigin')
  })

  test('setTargetOrigin uses default when undefined', () => {
    const v = setTargetOrigin(undefined)

    expect(v).toBe('https://p')
    expect(log).not.toHaveBeenCalled()
  })
})
