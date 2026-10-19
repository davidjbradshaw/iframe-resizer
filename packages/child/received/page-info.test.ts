import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('./utils', () => ({
  getData: () => '{"pi":true}',
  notExpected: vi.fn(),
  parseFrozen: (s) => Object.freeze(JSON.parse(s)),
}))
vi.mock('../console', () => ({ log: vi.fn() }))

const { notExpected } = await import('./utils')
const { PAGE_INFO } = await import('@iframe-resizer/common/consts')
const { default: pageInfo } = await import('./page-info')

describe('child/received/page-info', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('asks the parent to stop sending page info', () => {
    pageInfo({ data: 'x' })

    expect(notExpected).toHaveBeenCalledWith(PAGE_INFO)
  })
})
