/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn() }))

vi.mock('./position', () => {
  let stored = { x: 0, y: 0 }
  const getStoredPagePosition = vi.fn(() => stored)
  const setStoredPagePosition = vi.fn((pos) => {
    stored = pos
  })
  const unsetPagePosition = vi.fn()
  const setPagePosition = vi.fn()
  const getPagePosition = vi.fn(() => ({ x: 10, y: 20 }))
  return {
    getStoredPagePosition,
    setStoredPagePosition,
    unsetPagePosition,
    setPagePosition,
    getPagePosition,
  }
})

// Import after mocks
import {
  scrollBy,
  scrollTo,
  scrollToOffset,
  getElementPosition,
} from './scroll'
import * as coreConsole from '../console'
import {
  getPagePosition,
  setStoredPagePosition,
  unsetPagePosition,
} from './position'

describe('core/page/scroll behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    coreConsole.info.mockClear()
    setStoredPagePosition({ x: 0, y: 0 })
    delete window.parentIframe
    delete window.parentIFrame
  })

  it('scrollBy logs and delegates to parentIframe when present', () => {
    const target = { scrollBy: vi.fn() }
    // V4 compatibility alias
    // eslint-disable-next-line no-undef
    window.parentIframe = target
    scrollBy({ id: 'x', width: 5, height: 6 })
    expect(coreConsole.info).toHaveBeenCalled()
    expect(target.scrollBy).toHaveBeenCalledWith(5, 6)
  })

  it('getElementPosition combines iframe and page positions', () => {
    const iframe = {
      id: 'frame',
      getBoundingClientRect: () => ({ left: 3, top: 4 }),
    }
    const pos = getElementPosition(iframe)
    expect(pos).toEqual({ x: 13, y: 24 })
    expect(getPagePosition).toHaveBeenCalledWith('frame')
  })

  it('scrollTo uses reposition path when parentIFrame missing', () => {
    scrollTo({ id: 'x', iframe: { id: 'frame' }, width: 7, height: 8 })
    expect(setStoredPagePosition).toHaveBeenCalledWith({ x: 7, y: 8 })
    expect(unsetPagePosition).not.toHaveBeenCalled()
  })

  it('scrollToOffset adds element offsets and uses parentIFrame path when present', () => {
    // Provide parentIFrame to use scrollParent path
    const target = { scrollToOffset: vi.fn() }
    // eslint-disable-next-line no-undef
    window.parentIFrame = target
    const iframe = {
      id: 'frame',
      getBoundingClientRect: () => ({ left: 2, top: 3 }),
    }
    scrollToOffset({ id: 'x', iframe, width: 10, height: 20 })
    // Expect added offsets (10+12, 20+23)
    expect(target.scrollToOffset).toHaveBeenCalledWith(22, 43)
  })
})
