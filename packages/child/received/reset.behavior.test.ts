import { beforeEach, describe, expect, test, vi } from 'vitest'

import state from '../values/state'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../page/reset', () => ({ triggerReset: vi.fn() }))

const { triggerReset } = await import('../page/reset')

describe('child/received/reset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('logs and returns when initLock set', async () => {
    state.initLock = true
    const { default: reset } = await import('./reset')
    reset()

    expect(triggerReset).not.toHaveBeenCalled()
  })

  test('triggers reset when unlocked', async () => {
    state.initLock = false
    const { default: reset } = await import('./reset')
    reset()

    expect(triggerReset).toHaveBeenCalledWith('resetPage')
  })
})
