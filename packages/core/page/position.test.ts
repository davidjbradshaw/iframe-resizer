import { beforeEach, describe, expect, test, vi } from 'vitest'

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

  test('getPagePosition returns existing position without re-initializing', () => {
    page.position = { x: 10, y: 20 }
    const pos = positionMod.getPagePosition('id')

    expect(pos).toEqual({ x: 10, y: 20 })
    expect(log).toHaveBeenCalled()
  })

  test('setPagePosition returns early when position is null', () => {
    page.position = null
    positionMod.setPagePosition('id')

    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(info).not.toHaveBeenCalled()
  })

  test('setPagePosition scrolls and unsets', () => {
    page.position = { x: 7, y: 8 }
    positionMod.setPagePosition('id')

    expect(window.scrollTo).toHaveBeenCalledWith(7, 8)
    expect(info).toHaveBeenCalled()
    expect(page.position).toBe(null)
  })

  test('setStoredPagePosition sets position', () => {
    const newPos = { x: 100, y: 200 }
    positionMod.setStoredPagePosition(newPos)

    expect(page.position).toEqual(newPos)
  })

  test('getStoredPagePosition returns current position', () => {
    page.position = { x: 50, y: 60 }
    const pos = positionMod.getStoredPagePosition()

    expect(pos).toEqual({ x: 50, y: 60 })
  })
})
