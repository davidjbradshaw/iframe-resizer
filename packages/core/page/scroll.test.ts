import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn() }))
vi.mock('../events/wrapper', () => ({ default: vi.fn(() => true) }))
vi.mock('../values/settings', () => ({
  default: { id: { iframe: { id: 'id' } } },
}))
vi.mock('./position', () => ({
  getPagePosition: vi.fn(() => ({ x: 1, y: 2 })),
  getStoredPagePosition: vi.fn(() => ({ x: 5, y: 6 })),
  setPagePosition: vi.fn(),
  setStoredPagePosition: vi.fn(),
  unsetPagePosition: vi.fn(),
}))

const scrollMod = await import('./scroll')
const on = (await import('../events/wrapper')).default
const position = await import('./position')
const { info } = await import('../console')

describe('core/page/scroll', () => {
  const origScrollBy = window.scrollBy

  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollBy = vi.fn()
  })

  afterEach(() => {
    window.scrollBy = origScrollBy
    delete window.parentIframe
    delete window.parentIFrame
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

  test('scrollToLink unsets position when onScroll returns false', () => {
    on.mockReturnValueOnce(false)
    scrollMod.scrollToLink('id')

    expect(on).toHaveBeenCalled()
    expect(position.unsetPagePosition).toHaveBeenCalled()
    expect(position.setPagePosition).not.toHaveBeenCalled()
  })

  test('scrollTo calls scrollRequestFromChild without offset', () => {
    window.parentIframe = {
      scrollTo: vi.fn(),
    }

    scrollMod.scrollTo({
      id: 'id',
      iframe: { id: 'id' },
      height: 10,
      width: 20,
    })

    expect(window.parentIframe.scrollTo).toHaveBeenCalledWith(20, 10)
    expect(info).toHaveBeenCalled()
  })

  test('scrollToOffset calls scrollRequestFromChild with offset', () => {
    window.parentIframe = {
      scrollToOffset: vi.fn(),
    }

    const iframe = {
      id: 'id',
      getBoundingClientRect: () => ({ left: 5, top: 10 }),
    }

    scrollMod.scrollToOffset({ id: 'id', iframe, height: 10, width: 20 })

    expect(window.parentIframe.scrollToOffset).toHaveBeenCalledWith(26, 22)
    expect(info).toHaveBeenCalled()
  })

  test('scrollBy uses parentIFrame (v4 compatibility)', () => {
    window.parentIframe = undefined
    window.parentIFrame = {
      scrollBy: vi.fn(),
    }

    scrollMod.scrollBy({ id: 'id', height: 10, width: 20 })

    expect(window.parentIFrame.scrollBy).toHaveBeenCalledWith(20, 10)

    delete window.parentIFrame
  })
})
