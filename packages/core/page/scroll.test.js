import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn() }))
vi.mock('../events/wrapper', () => ({ default: vi.fn(() => true) }))
vi.mock('../values/settings', () => ({ default: { id: { iframe: { id: 'id' } } } }))
vi.mock('./position', () => ({ getPagePosition: vi.fn(() => ({ x: 1, y: 2 })), getStoredPagePosition: vi.fn(() => ({ x: 5, y: 6 })), setPagePosition: vi.fn(), setStoredPagePosition: vi.fn(), unsetPagePosition: vi.fn() }))

const scrollMod = await import('./scroll')
const on = (await import('../events/wrapper')).default
const position = await import('./position')
const info = (await import('../console')).info

describe('core/page/scroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollBy = vi.fn()
  })

  test('getElementPosition adds iframe and page positions', () => {
    const el = { getBoundingClientRect: () => ({ left: 3, top: 4 }), id: 'id' }
    const p = scrollMod.getElementPosition(el)
    expect(p).toEqual({ x: 4, y: 6 })
  })

  test('scrollToLink calls onScroll and setPagePosition', () => {
    scrollMod.scrollToLink('id')
    expect(on).toHaveBeenCalled()
    expect(position.setPagePosition).toHaveBeenCalledWith('id')
  })

  test('scrollBy forwards to target and logs', () => {
    scrollMod.scrollBy({ id: 'id', height: 10, width: 20 })
    expect(window.scrollBy).toHaveBeenCalledWith(20, 10)
    expect(info).toHaveBeenCalled()
  })
})
