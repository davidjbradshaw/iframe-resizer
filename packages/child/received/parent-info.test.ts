import { beforeEach, describe, expect, test, vi } from 'vitest'

import state from '../values/state'

vi.mock('./utils', () => ({
  getData: () => '{"pi":false}',
  notExpected: vi.fn(),
  parseFrozen: (s) => Object.freeze(JSON.parse(s)),
}))
vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('@iframe-resizer/common', () => ({
  isolateUserCode: (fn, arg) => fn?.(arg),
}))

const { notExpected } = await import('./utils')

describe('child/received/parent-info', () => {
  beforeEach(() => {
    state.parentInfo = null
    state.parentInfoListeners.clear()
    vi.clearAllMocks()
  })

  test('calls every subscriber and keeps the data', async () => {
    const first = vi.fn()
    const second = vi.fn()
    state.parentInfoListeners.add(first)
    state.parentInfoListeners.add(second)
    const { default: parentInfo } = await import('./parent-info')
    parentInfo({ data: 'x' })

    expect(first).toHaveBeenCalledWith({ pi: false })
    expect(second).toHaveBeenCalledWith({ pi: false })
    expect(state.parentInfo).toEqual({ pi: false })
    expect(notExpected).not.toHaveBeenCalled()
  })

  test('sends notExpected when no handler', async () => {
    const { default: parentInfo } = await import('./parent-info')
    parentInfo({ data: 'x' })

    expect(notExpected).toHaveBeenCalled()
    expect(state.parentInfo).toBe(null)
  })
})
