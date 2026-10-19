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
    delete callbacks.cb
    // The first observer is the main one; the second watches for a new body
    globalThis.MutationObserver = function (cb) {
      callbacks.cb ??= cb
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

  test('names its event before it logs the records', () => {
    const obs = createMutationObserver(vi.fn())
    vi.clearAllMocks()

    callbacks.cb([
      { addedNodes: [document.createElement('div')], removedNodes: [] },
    ])

    expect(consoleMod.event).toHaveBeenCalledWith('mutationObserver')
    expect(consoleMod.info).toHaveBeenCalledWith(
      'Mutations:',
      expect.any(Array),
    )
    expect(
      vi.mocked(consoleMod.event).mock.invocationCallOrder[0],
    ).toBeLessThan(vi.mocked(consoleMod.info).mock.invocationCallOrder[0])

    obs.disconnect()
  })

  test('falls back to documentElement when document.body is null', () => {
    const bodyDescriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'body',
    )!
    Object.defineProperty(document, 'body', {
      configurable: true,
      get: () => null,
    })

    try {
      const observe = vi.fn()
      globalThis.MutationObserver = function (cb) {
        callbacks.cb ??= cb
        this.observe = observe
        this.disconnect = vi.fn()
      }

      const obs = createMutationObserver(vi.fn())
      expect(observe).toHaveBeenNthCalledWith(
        1,
        document.documentElement,
        expect.objectContaining({ subtree: true }),
      )
      obs.disconnect()
    } finally {
      Object.defineProperty(document, 'body', bodyDescriptor)
    }
  })

  test('moves to a replaced body and passes on the change of content', () => {
    const instances: any[] = []
    globalThis.MutationObserver = function (cb) {
      instances.push(this)
      this.cb = cb
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      this.takeRecords = vi.fn(() => [])
    }
    const oldChild = document.createElement('p')
    document.body.append(oldChild)
    let seen: { added: Node[]; removed: Node[] } | undefined
    const obs = createMutationObserver(({ addedNodes, removedNodes }) => {
      seen = { added: [...addedNodes], removed: [...removedNodes] }
    })
    const [main, bodyWatcher] = instances

    expect(bodyWatcher.observe).toHaveBeenCalledWith(document.documentElement, {
      childList: true,
    })

    // What Turbo Drive does on navigation, with a record still queued on the
    // old body when the move happens
    const newBody = document.createElement('body')
    const newChild = document.createElement('div')
    newBody.append(newChild)
    const queuedChild = document.createElement('span')
    main.takeRecords.mockReturnValueOnce([
      { addedNodes: [queuedChild], removedNodes: [] },
    ])
    document.body.replaceWith(newBody)
    bodyWatcher.cb([])

    expect(main.takeRecords).toHaveBeenCalled()
    expect(main.disconnect).toHaveBeenCalled()
    expect(main.observe).toHaveBeenLastCalledWith(
      newBody,
      expect.objectContaining({ childList: true, subtree: true }),
    )
    expect(seen).toEqual({
      added: [queuedChild, newChild],
      removed: [oldChild],
    })

    obs.disconnect()

    expect(bodyWatcher.disconnect).toHaveBeenCalled()
  })

  test('skips non-element removed nodes (shouldSkip branch)', () => {
    const callback = vi.fn()
    const obs = createMutationObserver(callback)

    const textNode = document.createTextNode('ignored')
    const scriptEl = document.createElement('script')

    callbacks.cb([{ addedNodes: [], removedNodes: [textNode, scriptEl] }])
    vi.runAllTimers()

    // Neither node should be tracked as a regular element removal
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ removedNodes: expect.any(Set) }),
    )
    const { removedNodes } = callback.mock.calls[0][0]
    expect(removedNodes.has(textNode)).toBe(false)
    expect(removedNodes.has(scriptEl)).toBe(false)

    obs.disconnect()
  })

  test('queues additional mutations while one is pending (early return)', () => {
    // Defer RAF so we can pile up mutation callbacks without flushing
    let rafCb: (() => void) | null = null
    globalThis.requestAnimationFrame = (cb) => {
      rafCb ??= cb
      return 1
    }

    const seen: Array<Set<Node>> = []
    const callback = vi.fn((m: { addedNodes: Set<Node> }) => {
      seen.push(new Set(m.addedNodes))
    })
    const obs = createMutationObserver(callback)
    const el1 = document.createElement('div')
    const el2 = document.createElement('span')

    // First batch schedules rAF
    callbacks.cb([{ addedNodes: [el1], removedNodes: [] }])
    // Second batch hits the `if (pending) return` path
    callbacks.cb([{ addedNodes: [el2], removedNodes: [] }])

    rafCb!()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(seen[0].has(el1)).toBe(true)
    expect(seen[0].has(el2)).toBe(true)

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
