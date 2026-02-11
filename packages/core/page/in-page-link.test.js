import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn(), log: vi.fn() }))
vi.mock('../values/page', () => ({ default: { position: null } }))
vi.mock('./scroll', () => ({
  getElementPosition: vi.fn(() => ({ x: 10, y: 20 })),
  scrollToLink: vi.fn(),
}))

const inPageLink = (await import('./in-page-link')).default
const { getElementPosition, scrollToLink } = await import('./scroll')
const { log } = await import('../console')

describe('core/page/in-page-link', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    delete window.parentIframe
    delete window.parentIFrame
    Object.defineProperty(window, 'top', { value: window, configurable: true })
    Object.defineProperty(window, 'self', { value: window, configurable: true })
  })

  test('jumps to target when element exists', () => {
    const el = document.createElement('a')
    el.id = 'foo'
    document.body.append(el)
    inPageLink('id', 'http://x/#foo')

    expect(getElementPosition).toHaveBeenCalled()
    expect(scrollToLink).toHaveBeenCalled()
    expect(window.location.hash).toBe('#foo')
  })

  test('logs not found when top === self and element missing', () => {
    inPageLink('id', 'http://x/#bar')

    expect(log).toHaveBeenCalled()
  })
})
