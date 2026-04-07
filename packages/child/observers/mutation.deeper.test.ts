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

  test('logs when nodes are removed from the page', () => {
    const callback = vi.fn()
    const obs = createMutationObserver(callback)
    const el1 = document.createElement('div')
    const el2 = document.createElement('span')

    // simulate removing nodes that were never added
    callbacks.cb([{ addedNodes: [], removedNodes: [el1, el2] }])
    vi.runAllTimers()

    expect(consoleMod.log).toHaveBeenCalledWith(
      expect.stringContaining('2'),
      expect.anything(),
      expect.anything(),
    )
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        removedNodes: expect.any(Set),
      }),
    )

    obs.disconnect()
  })

  test('logs when new nodes are added to the page', () => {
    const callback = vi.fn()
    const obs = createMutationObserver(callback)
    const el1 = document.createElement('div')
    const el2 = document.createElement('span')
    const el3 = document.createElement('p')

    // simulate adding nodes
    callbacks.cb([{ addedNodes: [el1, el2, el3], removedNodes: [] }])
    vi.runAllTimers()

    expect(consoleMod.log).toHaveBeenCalledWith(
      expect.stringContaining('3'),
      expect.anything(),
      expect.anything(),
    )
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        addedNodes: expect.any(Set),
      }),
    )

    obs.disconnect()
  })

  test('handles multiple mutations in sequence', () => {
    const callback = vi.fn()
    const obs = createMutationObserver(callback)
    const el1 = document.createElement('div')
    const el2 = document.createElement('span')

    // First batch of mutations
    callbacks.cb([{ addedNodes: [el1], removedNodes: [] }])
    vi.runAllTimers()

    expect(callback).toHaveBeenCalledTimes(1)

    // Second batch of mutations
    callbacks.cb([{ addedNodes: [el2], removedNodes: [] }])
    vi.runAllTimers()

    expect(callback).toHaveBeenCalledTimes(2)

    obs.disconnect()
  })

  test('throttles mutations when event loop is busy (delay > delayLimit)', () => {
    // Defer RAF so we can advance time between mutation and processing
    let rafCb: () => void
    globalThis.requestAnimationFrame = (cb) => {
      rafCb = cb
      return 1
    }

    let nowValue = 0
    vi.spyOn(performance, 'now').mockImplementation(() => nowValue)

    const callback = vi.fn()
    const obs = createMutationObserver(callback)
    const el1 = document.createElement('div')

    // Trigger mutation — perfMon set to 0
    callbacks.cb([{ addedNodes: [el1], removedNodes: [] }])

    // Simulate busy event loop before RAF fires
    nowValue = 50

    // Run RAF — processMutations sees delay=50 > delayLimit=18 → throttle
    rafCb()

    expect(consoleMod.event).toHaveBeenCalledWith('mutationThrottled')

    // Let deferred setTimeout run (delay=0 since perfMon=50=nowValue)
    vi.runAllTimers()

    obs.disconnect()
    performance.now.mockRestore()
  })

  afterAll(() => {
    globalThis.MutationObserver = origMO
    globalThis.requestAnimationFrame = origRAF
  })
})
