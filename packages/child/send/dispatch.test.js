import { beforeEach, describe, expect, test, vi } from 'vitest'

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
})
