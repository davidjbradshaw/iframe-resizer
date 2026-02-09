import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import visibilityObserver from './visibility'

vi.mock('../console', () => ({ info: vi.fn() }))

describe('child/observers/visibility', () => {
  let IO
  let observed
  let disconnect
  beforeEach(() => {
    observed = []
    disconnect = vi.fn()
    IO = class {
      constructor(cb) { this.cb = cb }
      observe = (el) => observed.push(el)
      disconnect = disconnect
    }
    Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: IO })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('observes documentElement and disconnects', () => {
    const cb = vi.fn()
    const api = visibilityObserver(cb)
    expect(observed).toContain(document.documentElement)

    // simulate last entry intersecting
    const inst = new IO((entries) => cb(entries.at(-1).isIntersecting))
    inst.cb([{ isIntersecting: false }, { isIntersecting: true }])
    expect(cb).toHaveBeenCalledWith(true)

    api.disconnect()
    expect(disconnect).toHaveBeenCalled()
  })
})
