import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import visibilityObserver from './visibility'

vi.mock('../console', () => ({ info: vi.fn() }))

describe('child/observers/visibility', () => {
  let IO
  let observed
  let disconnect
  let observerCallback
  beforeEach(() => {
    observed = []
    disconnect = vi.fn()
    observerCallback = null
    IO = class {
      constructor(cb) {
        this.cb = cb
        observerCallback = cb
        this.observe = (el) => {
          observed.push(el)
        }
        this.disconnect = disconnect
      }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: IO,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('observes documentElement and disconnects', () => {
    const cb = vi.fn()
    const api = visibilityObserver(cb)

    expect(observed).toContain(document.documentElement)

    // Use the actual observer callback created by visibilityObserver
    observerCallback([{ isIntersecting: false }, { isIntersecting: true }])

    expect(cb).toHaveBeenCalledWith(true)

    api.disconnect()

    expect(disconnect).toHaveBeenCalled()
  })

  test('handles visibility changes correctly', () => {
    const cb = vi.fn()
    visibilityObserver(cb)

    // Test with single entry
    observerCallback([{ isIntersecting: false }])
    expect(cb).toHaveBeenCalledWith(false)

    // Test with multiple entries (uses last one)
    cb.mockClear()
    observerCallback([
      { isIntersecting: false },
      { isIntersecting: false },
      { isIntersecting: true },
    ])
    expect(cb).toHaveBeenCalledWith(true)
  })
})
