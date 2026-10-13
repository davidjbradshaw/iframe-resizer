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

  test('skips already observed elements', () => {
    const cb = vi.fn()
    const api = setupResizeObserver(cb)

    const div = document.createElement('div')
    div.dataset.pos = 'absolute'

    // Observe the element for the first time
    api.attachObserverToNonStaticElements([div])
    const firstCallCount = observe.mock.calls.length

    // Try to observe the same element again
    api.attachObserverToNonStaticElements([div])
    const secondCallCount = observe.mock.calls.length

    // The observer should not have been called again for the already-observed element
    expect(secondCallCount).toBe(firstCallCount)

    api.disconnect()
  })

  test('handles multiple elements with mixed positions', () => {
    const cb = vi.fn()
    const api = setupResizeObserver(cb)

    const relative = document.createElement('div')
    const absolute = document.createElement('div')
    const fixed = document.createElement('div')
    const staticEl = document.createElement('div')

    relative.dataset.pos = 'relative'
    absolute.dataset.pos = 'absolute'
    fixed.dataset.pos = 'fixed'
    staticEl.dataset.pos = 'static'

    api.attachObserverToNonStaticElements([relative, absolute, fixed, staticEl])

    expect(observed).toContain(relative)
    expect(observed).toContain(absolute)
    expect(observed).toContain(fixed)
    expect(observed).not.toContain(staticEl)

    api.disconnect()
  })
})
