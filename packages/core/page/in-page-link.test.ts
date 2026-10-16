import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn(), log: vi.fn() }))
vi.mock('../values/page', () => ({ default: { position: null } }))
vi.mock('./scroll', () => ({
  getElementPosition: vi.fn(() => ({ x: 10, y: 20 })),
  scrollToLink: vi.fn(() => true),
}))

const inPageLink = (await import('./in-page-link')).default
const { getElementPosition, scrollToLink } = await import('./scroll')
const { log } = await import('../console')

describe('core/page/in-page-link', () => {
  // window.top can't be redefined, so move self away from it instead
  const simulateIframe = (): void => {
    Object.defineProperty(window, 'self', { value: {}, configurable: true })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    delete window.parentIframe
    Object.defineProperty(window, 'self', { value: window, configurable: true })
  })

  test('jumps to target when element exists', () => {
    const pushState = vi.spyOn(window.history, 'pushState')
    const el = document.createElement('a')
    el.id = 'foo'
    document.body.append(el)
    inPageLink('id', 'http://x/#foo')

    expect(getElementPosition).toHaveBeenCalled()
    expect(scrollToLink).toHaveBeenCalled()
    expect(window.location.hash).toBe('#foo')
    expect(pushState).not.toHaveBeenCalled()
  })

  test('updates the URL with pushState when onScroll cancels', () => {
    const el = document.createElement('a')
    el.id = 'cancel'
    document.body.append(el)
    const pushState = vi.spyOn(window.history, 'pushState')
    vi.mocked(scrollToLink).mockReturnValueOnce(false)

    inPageLink('id', 'http://x/#cancel')

    expect(pushState).toHaveBeenCalledWith(null, '', '#cancel')
    expect(window.location.hash).toBe('#cancel')
    pushState.mockRestore()
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
