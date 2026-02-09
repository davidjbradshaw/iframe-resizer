import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../../common/utils', () => ({ typeAssert: vi.fn() }))
vi.mock('../send/size', () => ({ default: vi.fn() }))

const { typeAssert } = await import('../../common/utils')
const sendSize = (await import('../send/size')).default
const { MANUAL_RESIZE_REQUEST } = await import('../../common/consts')
const resize = (await import('./resize')).default

describe('child/methods/resize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  test('sends manual resize with both dims', () => {
    resize(100, 200)
    expect(typeAssert).toHaveBeenCalledTimes(2)
    expect(sendSize).toHaveBeenCalledWith(
      MANUAL_RESIZE_REQUEST,
      'parentIframe.resize(100,200)',
      100,
      200,
    )
  })

  test('sends manual resize with just height', () => {
    resize(150)
    expect(typeAssert).toHaveBeenCalledTimes(1)
    expect(sendSize).toHaveBeenCalledWith(
      MANUAL_RESIZE_REQUEST,
      'parentIframe.resize(150)',
      150,
      undefined,
    )
  })
})
