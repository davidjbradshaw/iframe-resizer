import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import setupResizeObserver, { attachObserverToNonStaticElements as exportedAttach } from './resize'

vi.mock('../console', () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn() }))

describe('child/observers/resize', () => {
  let RO
  let observed
  let unobserve
  let observe
  let disconnect
  beforeEach(() => {
    observed = []
    unobserve = vi.fn()
    disconnect = vi.fn()
    observe = vi.fn((el) => observed.push(el))
    RO = class {
      constructor(cb) { this.cb = cb }
      observe = observe
      unobserve = unobserve
      disconnect = disconnect
    }
    Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: RO })
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => ({ position: el.getAttribute('data-pos') || 'static' }))
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('observes body and attaches to non-static elements; detaches and disconnects', () => {
    const cb = vi.fn()
    const api = setupResizeObserver(cb)
    expect(observed).toContain(document.body)

    const a = document.createElement('div')
    const b = document.createElement('div')
    a.setAttribute('data-pos', 'relative')
    b.setAttribute('data-pos', '') // treated as static

    api.attachObserverToNonStaticElements([a, b, document.createTextNode('t')])
    expect(observed).toContain(a)
    expect(observed).not.toContain(b)

    api.detachObservers([a])
    expect(unobserve).toHaveBeenCalledWith(a)

    api.disconnect()
    expect(disconnect).toHaveBeenCalled()
  })
})
