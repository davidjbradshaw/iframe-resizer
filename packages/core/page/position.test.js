import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn(), log: vi.fn() }))
vi.mock('../values/page', () => ({ default: { position: null } }))

const positionMod = await import('./position')
const page = (await import('../values/page')).default
const { info, log } = await import('../console')

describe('core/page/position', () => {
  beforeEach(() => {
    page.position = null
    vi.clearAllMocks()
    Object.defineProperty(window, 'scrollX', { value: 3, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 4, configurable: true })
    window.scrollTo = vi.fn()
  })

  test('getPagePosition initializes and logs', () => {
    const pos = positionMod.getPagePosition('id')
    expect(pos).toEqual({ x: 3, y: 4 })
    expect(log).toHaveBeenCalled()
  })

  test('setPagePosition scrolls and unsets', () => {
    page.position = { x: 7, y: 8 }
    positionMod.setPagePosition('id')
    expect(window.scrollTo).toHaveBeenCalledWith(7, 8)
    expect(info).toHaveBeenCalled()
    expect(page.position).toBe(null)
  })
})
