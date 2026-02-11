import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as consoleMod from '../console'
import createMutationObserver from './mutation'

vi.useFakeTimers()

vi.mock('../console', () => ({
  debug: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
}))

describe('child/observers/mutation deeper', () => {
  const origMO = globalThis.MutationObserver
  const origRAF = globalThis.requestAnimationFrame
  const callbacks = {}

  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.requestAnimationFrame = (cb) => {
      cb()
      return 1
    }
    globalThis.MutationObserver = function (cb) {
      callbacks.cb = cb
      this.observe = vi.fn()
      this.disconnect = vi.fn()
    }
    document.body.innerHTML = ''
  })

  test('processes added and removed nodes and invokes callback', () => {
    const el1 = document.createElement('div')
    document.body.append(el1)
    const callback = vi.fn()
    const obs = createMutationObserver(callback)

    // simulate mutations
    callbacks.cb([
      { addedNodes: [el1], removedNodes: [] },
      { addedNodes: [], removedNodes: [el1] },
    ])
    // RAF flushes process
    vi.runAllTimers()

    expect(callback).toHaveBeenCalled()
    expect(consoleMod.info).toHaveBeenCalled()

    obs.disconnect()

    expect(consoleMod.info).toHaveBeenCalled()
  })

  afterAll(() => {
    globalThis.MutationObserver = origMO
    globalThis.requestAnimationFrame = origRAF
  })
})
