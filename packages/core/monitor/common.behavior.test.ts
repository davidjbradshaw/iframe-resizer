/* eslint import/first: 0, simple-import-sort/imports: 0, import/named: 0, class-methods-use-this: 0 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../../common/listeners', () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))

vi.mock('../send/trigger', () => ({ default: vi.fn() }))

vi.mock('../values/settings', () => {
  const settings = {
    x: {
      iframe: document.createElement('iframe'),
      console: {
        event: vi.fn(),
        log: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      },
    },
  }
  return { default: settings, __mockSettings: settings }
})

// Stub ResizeObserver
let pageCb
let iframeCb
class RO {
  constructor(cb) {
    if (pageCb) {
      iframeCb = cb
    } else {
      pageCb = cb
    }
  }

  observe() {
    // whenever observe is called, simulate a callback
    if (pageCb) pageCb()
    if (iframeCb) iframeCb()
  }

  disconnect() {}
}
// eslint-disable-next-line no-undef
global.ResizeObserver = RO
// Make RAF synchronous
global.requestAnimationFrame = (fn) => {
  fn()
  return 1
}

// Import after mocks
import { startInfoMonitor } from './common'
import { addEventListener, removeEventListener } from '../../common/listeners'
import trigger from '../send/trigger'
import { __mockSettings as mockSettings } from '../values/settings'

describe('core/monitor/common behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    addEventListener.mockClear()
    removeEventListener.mockClear()
    trigger.mockClear()
    pageCb = undefined
    iframeCb = undefined
  })

  it('startInfoMonitor sets listeners and observers and triggers info', () => {
    const sender = vi.fn((requestType, id) =>
      trigger(`${requestType} (PageInfo)`, `PageInfo:${id}`, id),
    )
    const start = startInfoMonitor(sender, 'PageInfo')
    start('x')

    // listeners setup
    expect(addEventListener).toHaveBeenCalled()
    // observers should have "observed" and triggered
    expect(trigger).toHaveBeenCalled()
    // stop function registered
    expect(typeof mockSettings.x.stopPageInfo).toBe('function')
  })

  it('stop function removes listeners and disconnects observers', () => {
    const sender = vi.fn((requestType, id) =>
      trigger(`${requestType} (PageInfo)`, `PageInfo:${id}`, id),
    )
    const start = startInfoMonitor(sender, 'PageInfo')
    start('x')
    const stop = mockSettings.x.stopPageInfo
    stop()
    expect(removeEventListener).toHaveBeenCalled()
  })

  it('sendInfo calls stop when settings[id] is deleted', () => {
    const sender = vi.fn((requestType, id) =>
      trigger(`${requestType} (PageInfo)`, `PageInfo:${id}`, id),
    )
    const start = startInfoMonitor(sender, 'PageInfo')
    start('x')

    // Delete settings[id] to simulate iframe removal
    delete mockSettings.x

    // Manually invoke the pageObserver callback which calls sendInfo
    // This should call stop() internally without throwing an error
    expect(() => {
      if (pageCb) {
        pageCb()
      }
    }).not.toThrow()

    // Verify that removeEventListener was called for window listeners
    expect(removeEventListener).toHaveBeenCalled()
  })
})
