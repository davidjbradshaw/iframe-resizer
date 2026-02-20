import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../send/size', () => ({ default: vi.fn() }))
vi.mock('../values/state', () => ({ default: { isHidden: false } }))

const { log } = await import('../console')
const sendSize = (await import('../send/size')).default
const state = (await import('../values/state')).default
const visibilityChange = (await import('./visibility')).default

describe('child/observed/visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('sets isHidden to false and sends size when visible', () => {
    visibilityChange(true)

    expect(log).toHaveBeenCalled()
    expect(state.isHidden).toBe(false)
    expect(sendSize).toHaveBeenCalledWith(
      'visibilityObserver',
      'Visibility changed',
    )
  })

  test('sets isHidden to true and sends size when hidden', () => {
    visibilityChange(false)

    expect(log).toHaveBeenCalled()
    expect(state.isHidden).toBe(true)
    expect(sendSize).toHaveBeenCalledWith(
      'visibilityObserver',
      'Visibility changed',
    )
  })
})
