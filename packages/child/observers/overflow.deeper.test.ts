import { OVERFLOW_ATTR } from '@iframe-resizer/common/consts'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as consoleMod from '../console'
import createOverflowObserver from './overflow'

vi.mock('../console', () => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}))

describe('child/observers/overflow deeper', () => {
  const origIO = globalThis.IntersectionObserver
  const origRAF = globalThis.requestAnimationFrame

  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.requestAnimationFrame = (cb) => {
      cb()
      return 1
    }
    globalThis.IntersectionObserver = function (cb) {
      globalThis.IntersectionObserver.prototype._cb = cb
      this.observe = vi.fn((node) => {
        this._node = node
      })
      this.disconnect = vi.fn()
    }
    document.body.innerHTML = ''
  })

  test('sets overflow attribute based on edge vs rootBounds', () => {
    const node = document.createElement('div')
    Object.defineProperty(node, 'offsetParent', { get: () => document.body })
    document.body.append(node)
    const cb = vi.fn()
    const obs = createOverflowObserver(cb, {
      side: 'bottom',
      root: document.body,
    })

    // Attach and simulate an observation cycle
    obs.attachObservers([node])
    const rect = { bottom: 200 }
    const rootBounds = { bottom: 150 }
    const target = node
    const entry = { boundingClientRect: rect, rootBounds, target }
    // trigger callback
    globalThis.IntersectionObserver.prototype._cb([entry])

    expect(node.hasAttribute(OVERFLOW_ATTR)).toBe(true)
    expect(consoleMod.info).toHaveBeenCalled()

    obs.disconnect()

    expect(consoleMod.info).toHaveBeenCalled()
  })

  test('measures the bottom edge when no side is given', () => {
    const node = document.createElement('div')
    Object.defineProperty(node, 'offsetParent', { get: () => document.body })
    document.body.append(node)
    const obs = createOverflowObserver(vi.fn(), { root: document.body })
    obs.attachObservers([node])

    const observe = (boundingClientRect) =>
      globalThis.IntersectionObserver.prototype._cb([
        {
          boundingClientRect,
          rootBounds: { bottom: 150, right: 150 },
          target: node,
        },
      ])

    // Only the bottom edge counts, not the right
    observe({ bottom: 100, right: 300 })
    expect(node.hasAttribute(OVERFLOW_ATTR)).toBe(false)

    observe({ bottom: 200, right: 100 })
    expect(node.hasAttribute(OVERFLOW_ATTR)).toBe(true)

    obs.disconnect()
  })

  test('does not observe nodes that are not elements', () => {
    const observe = vi.fn()
    globalThis.IntersectionObserver = function () {
      this.observe = observe
      this.disconnect = vi.fn()
    }

    const node = document.createElement('div')
    const text = document.createTextNode('text')
    document.body.append(node, text)
    const obs = createOverflowObserver(vi.fn(), {
      side: 'bottom',
      root: document.body,
    })

    obs.attachObservers([text, node])

    expect(observe).toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledWith(node)
    // Counted as one element, so the text node was not
    expect(consoleMod.info).toHaveBeenCalledWith(
      expect.stringMatching(/%c1%c element$/),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )

    obs.disconnect()
  })

  test('skips already observed elements', () => {
    const node = document.createElement('div')
    document.body.append(node)
    const cb = vi.fn()
    const obs = createOverflowObserver(cb, {
      side: 'bottom',
      root: document.body,
    })

    let observeCalls = 0
    globalThis.IntersectionObserver.prototype.observe = vi.fn(() => {
      observeCalls++
    })

    // Attach the element for the first time
    obs.attachObservers([node])
    const firstCallCount = observeCalls

    // Try to attach the same element again
    obs.attachObservers([node])
    const secondCallCount = observeCalls

    // Should not have called observe again for already-observed element
    expect(secondCallCount).toBe(firstCallCount)

    obs.disconnect()
  })

  test('handles hidden elements correctly', () => {
    const hiddenNode = document.createElement('div')
    hiddenNode.hidden = true
    Object.defineProperty(hiddenNode, 'offsetParent', {
      get: () => document.body,
    })
    document.body.append(hiddenNode)

    const cb = vi.fn()
    const obs = createOverflowObserver(cb, {
      side: 'bottom',
      root: document.body,
    })

    obs.attachObservers([hiddenNode])

    // Simulate overflow condition
    const rect = { bottom: 200 }
    const rootBounds = { bottom: 150 }
    const entry = { boundingClientRect: rect, rootBounds, target: hiddenNode }
    globalThis.IntersectionObserver.prototype._cb([entry])

    // Hidden elements should not get overflow attribute even when overflowing
    expect(hiddenNode.hasAttribute(OVERFLOW_ATTR)).toBe(false)

    obs.disconnect()
  })

  test('skips entries where rootBounds is null', () => {
    const node = document.createElement('div')
    document.body.append(node)
    const cb = vi.fn()
    const obs = createOverflowObserver(cb, {
      side: 'bottom',
      root: document.body,
    })

    obs.attachObservers([node])

    // Entry with null rootBounds should be skipped (the !rootBounds guard)
    const entry = {
      boundingClientRect: { bottom: 200 },
      rootBounds: null,
      target: node,
    }
    globalThis.IntersectionObserver.prototype._cb([entry])

    // No overflow attribute should be set since rootBounds is null
    expect(node.hasAttribute(OVERFLOW_ATTR)).toBe(false)

    obs.disconnect()
  })

  test('uses identity fallback when requestAnimationFrame is unavailable', () => {
    // Temporarily remove requestAnimationFrame BEFORE creating the observer so
    // `afterReflow` is set to the identity fallback `id` (not RAF)
    const origRAFLocal = window.requestAnimationFrame
    delete window.requestAnimationFrame

    const node = document.createElement('div')
    Object.defineProperty(node, 'offsetParent', { get: () => document.body })
    document.body.append(node)
    const cb = vi.fn()
    const obs = createOverflowObserver(cb, {
      side: 'bottom',
      root: document.body,
    })

    obs.attachObservers([node])

    // With `id` fallback, `afterReflow(fn)` returns fn without calling it — no throw
    const entry = {
      boundingClientRect: { bottom: 200 },
      rootBounds: { bottom: 150 },
      target: node,
    }
    expect(() => {
      globalThis.IntersectionObserver.prototype._cb([entry])
    }).not.toThrow()

    // Overflow attribute should still be toggled even without RAF
    expect(node.hasAttribute(OVERFLOW_ATTR)).toBe(true)

    window.requestAnimationFrame = origRAFLocal
    obs.disconnect()
  })

  afterAll(() => {
    globalThis.IntersectionObserver = origIO
    globalThis.requestAnimationFrame = origRAF
  })
})
