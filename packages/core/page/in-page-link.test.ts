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
  const simulateIframe = () => {
    Object.defineProperty(window, 'top', { value: {}, configurable: true })
    Object.defineProperty(window, 'self', { value: window, configurable: true })
  }

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

  test('calls parentIframe.moveToAnchor when element not found in iframe', () => {
    simulateIframe()

    const moveToAnchor = vi.fn()
    window.parentIframe = { moveToAnchor }

    inPageLink('id', 'http://x/#baz')

    expect(moveToAnchor).toHaveBeenCalledWith('baz')
  })

  test('calls parentIFrame.moveToAnchor (v4 compatibility) when element not found', () => {
    simulateIframe()

    const moveToAnchor = vi.fn()
    window.parentIFrame = { moveToAnchor }

    inPageLink('id', 'http://x/#qux')

    expect(moveToAnchor).toHaveBeenCalledWith('qux')
  })

  test('logs not found when parentIframe not available in iframe', () => {
    simulateIframe()

    inPageLink('id', 'http://x/#missing')

    expect(log).toHaveBeenCalledWith(
      'id',
      expect.stringContaining('#missing not found'),
    )
  })

  test('handles location without hash', () => {
    inPageLink('id', 'http://x/')

    expect(log).toHaveBeenCalled()
  })
})
