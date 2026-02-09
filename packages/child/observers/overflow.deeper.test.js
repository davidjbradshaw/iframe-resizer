import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ debug: vi.fn(), info: vi.fn() }))
import { OVERFLOW_ATTR } from '../../common/consts'
import * as consoleMod from '../console'
import createOverflowObserver from './overflow'

describe('child/observers/overflow deeper', () => {
  const entries = []
  const origIO = globalThis.IntersectionObserver
  const origRAF = globalThis.requestAnimationFrame

  beforeEach(() => {
    vi.clearAllMocks()
    entries.length = 0
    globalThis.requestAnimationFrame = (cb) => { cb(); return 1 }
    globalThis.IntersectionObserver = function(cb) { globalThis.IntersectionObserver.prototype._cb = cb; this.observe = vi.fn((node) => { this._node = node }); this.disconnect = vi.fn() }
    document.body.innerHTML = ''
  })

  test('sets overflow attribute based on edge vs rootBounds', () => {
    const node = document.createElement('div')
    Object.defineProperty(node, 'offsetParent', { get: () => document.body })
    document.body.appendChild(node)
    const cb = vi.fn()
    const obs = createOverflowObserver(cb, { side: 'bottom', root: document.body })

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

  afterAll(() => { globalThis.IntersectionObserver = origIO; globalThis.requestAnimationFrame = origRAF })
})
