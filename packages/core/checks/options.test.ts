import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ advise: vi.fn() }))

const checkOptions = (await import('./options')).default
const { advise } = await import('../console')

describe('core/checks/options', () => {
  test('advises when deprecated options present', () => {
    const out = checkOptions('id', {
      sizeWidth: true,
      sizeHeight: true,
      autoResize: true,
    })

    expect(out).toEqual({ sizeWidth: true, sizeHeight: true, autoResize: true })
    expect(advise).toHaveBeenCalled()
  })
})
