import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import createTitleObserver from './title'

vi.mock('../console', () => ({ info: vi.fn() }))

describe('child/observers/title', () => {
  let MO: ReturnType<typeof vi.fn>
  let observedTarget: Node | null
  let observedConfig: MutationObserverInit | null
  let observerCallback: (() => void) | null
  let disconnect: ReturnType<typeof vi.fn>

  beforeEach(() => {
    observedTarget = null
    observedConfig = null
    observerCallback = null
    disconnect = vi.fn()

    MO = class {
      constructor(cb: () => void) {
        observerCallback = cb
      }
      observe(target: Node, config: MutationObserverInit) {
        observedTarget = target
        observedConfig = config
      }
      disconnect = disconnect
    }

    Object.defineProperty(window, 'MutationObserver', {
      configurable: true,
      value: MO,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('observes head with characterData, childList and subtree', () => {
    const cb = vi.fn()
    createTitleObserver(cb)

    expect(observedTarget).toBe(document.head)
    expect(observedConfig).toMatchObject({
      characterData: true,
      childList: true,
      subtree: true,
    })
  })

  test('calls callback immediately on creation (sends initial title)', () => {
    const cb = vi.fn()
    createTitleObserver(cb)

    expect(cb).toHaveBeenCalledTimes(1)
  })

  test('calls callback when a mutation is observed', () => {
    const cb = vi.fn()
    createTitleObserver(cb)

    cb.mockClear()
    observerCallback!()

    expect(cb).toHaveBeenCalledTimes(1)
  })

  test('disconnects the observer', () => {
    const cb = vi.fn()
    const api = createTitleObserver(cb)

    api.disconnect()

    expect(disconnect).toHaveBeenCalled()
  })

  test('falls back to documentElement when head is null', () => {
    const original = document.head
    Object.defineProperty(document, 'head', {
      configurable: true,
      get: () => null,
    })

    const cb = vi.fn()
    createTitleObserver(cb)

    expect(observedTarget).toBe(document.documentElement)

    Object.defineProperty(document, 'head', {
      configurable: true,
      get: () => original,
    })
  })
})
