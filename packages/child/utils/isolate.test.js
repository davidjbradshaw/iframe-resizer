import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ advise: vi.fn(), error: vi.fn() }))
vi.mock('../values/settings', () => ({ default: { mode: 0 } }))

const isolate = (await import('./isolate')).default
const { advise, error } = await import('../console')

describe('child/utils/isolate', () => {
  test('runs functions and logs advise/error on exception when mode >= 0', () => {
    const fnOk = vi.fn()
    const fnErr = vi.fn(() => {
      throw new Error('boom')
    })
    isolate([fnOk, fnErr])

    expect(fnOk).toHaveBeenCalled()
    expect(advise).toHaveBeenCalled()
    expect(error).toHaveBeenCalled()
  })
})
