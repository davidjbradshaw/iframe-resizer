import { beforeEach, describe, expect, test, vi } from 'vitest'

import state from '../values/state'

vi.mock('./utils', () => ({
  getData: () => '{"pi":false}',
  notExpected: vi.fn(),
  parseFrozen: (s) => Object.freeze(JSON.parse(s)),
}))
vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../../common/utils', () => ({
  isolateUserCode: (fn, arg) => fn?.(arg),
}))

const { notExpected } = await import('./utils')

describe('child/received/parent-info', () => {
  beforeEach(() => {
    state.onParentInfo = undefined
    vi.clearAllMocks()
  })

  test('calls user onParentInfo when provided', async () => {
    const spy = vi.fn()
    state.onParentInfo = spy
    const { default: parentInfo } = await import('./parent-info')
    parentInfo({ data: 'x' })

    expect(spy).toHaveBeenCalledWith({ pi: false })
  })

  test('sends notExpected when no handler', async () => {
    const { default: parentInfo } = await import('./parent-info')
    parentInfo({ data: 'x' })

    expect(notExpected).toHaveBeenCalled()
  })
})
