import { beforeEach, describe, expect, test, vi } from 'vitest'

import { INIT } from '../../common/consts'
import state from '../values/state'
import getContentSize from './content'

vi.mock('../console', () => ({
  info: vi.fn(),
  log: vi.fn(),
  purge: vi.fn(),
}))

describe('child/size/content', () => {
  beforeEach(() => {
    state.height = 0
    state.width = 0
    vi.clearAllMocks()
  })

  test('returns state with updated size when change detected', () => {
    const ret = getContentSize('resize', 'manual', 100, 200)

    expect(ret).toBe(state)
    expect(state.height).toBe(100)
    expect(state.width).toBe(200)
  })

  test('returns null for observer events when no change', () => {
    state.height = 100
    state.width = 200
    const ret = getContentSize('overflowObserver', 'overflow', 100, 200)

    expect(ret).toBeNull()
  })

  test('returns state for INIT event and updates size', async () => {
    const { info, purge } = await import('../console')

    const ret = getContentSize(INIT, 'init', 150, 250)

    expect(ret).toBe(state)
    expect(state.height).toBe(150)
    expect(state.width).toBe(250)
    expect(purge).not.toHaveBeenCalled()
    expect(info).not.toHaveBeenCalled()
  })
})
