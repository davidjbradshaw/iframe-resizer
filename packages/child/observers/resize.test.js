import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import setupResizeObserver from './resize'

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
      constructor(cb) {
        this.cb = cb
        this.observe = observe
        this.unobserve = unobserve
        this.disconnect = disconnect
      }
    }
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: RO,
    })
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => ({
      position: el.dataset.pos || 'static',
    }))
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
    a.dataset.pos = 'relative'
    b.dataset.pos = '' // treated as static

    api.attachObserverToNonStaticElements([a, b, document.createTextNode('t')])

    expect(observed).toContain(a)
    expect(observed).not.toContain(b)

    api.detachObservers([a])

    expect(unobserve).toHaveBeenCalledWith(a)

    api.disconnect()

    expect(disconnect).toHaveBeenCalled()
  })
})
