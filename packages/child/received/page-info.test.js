import { beforeEach, describe, expect, test, vi } from 'vitest'

import state from '../values/state'

vi.mock('./utils', () => ({
  getData: () => '{"pi":true}',
  notExpected: vi.fn(),
  parse: JSON.parse,
  parseFrozen: (s) => Object.freeze(JSON.parse(s)),
}))
vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../../common/utils', () => ({
  isolateUserCode: (fn, arg) => fn?.(arg),
}))

const { notExpected } = await import('./utils')

describe('child/received/page-info', () => {
  beforeEach(() => {
    state.onPageInfo = undefined
    vi.clearAllMocks()
  })

  test('calls user onPageInfo when provided', async () => {
    const spy = vi.fn()
    state.onPageInfo = spy
    const { default: pageInfo } = await import('./page-info')
    pageInfo({ data: 'x' })

    expect(spy).toHaveBeenCalledWith({ pi: true })
  })

  test('sends notExpected when no handler', async () => {
    const { default: pageInfo } = await import('./page-info')
    pageInfo({ data: 'x' })

    expect(notExpected).toHaveBeenCalled()
  })
})
