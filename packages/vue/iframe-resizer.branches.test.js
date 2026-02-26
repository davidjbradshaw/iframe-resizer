/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockResizer = {
  moveToAnchor: vi.fn(),
  resize: vi.fn(),
  sendMessage: vi.fn(),
  disconnect: vi.fn(),
}

let capturedOptions = {}

// Mock core connect to expose options passed to connectResizer
vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn((options) => {
    // simulate internal mutation performed by connectResizer
    // so consoleOptions.expand picks it up
    // eslint-disable-next-line no-param-reassign
    options.logExpand = true
    capturedOptions = options
    return () => mockResizer
  }),
}))

// Mock auto-console-group and capture spies
const acg = {
  event: vi.fn(),
  label: vi.fn(),
  expand: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
}
vi.mock('auto-console-group', () => ({
  default: () => acg,
}))

import { createApp, nextTick } from 'vue'
import IframeResizer from './iframe-resizer.vue'

describe('Vue iframe-resizer branches', () => {
  let container
  let app

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    capturedOptions = {}
    vi.clearAllMocks()
  })

  afterEach(() => {
    app?.unmount()
    container.remove()
    app = null
  })

  it('does not log when props.log is -1 (no logging)', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3', log: -1 })
    app.mount(container)
    await nextTick()

    expect(acg.event).toHaveBeenCalledWith('setup')
    expect(acg.log).not.toHaveBeenCalled()
  })

  it('does not log when props.log is false', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3', log: false })
    app.mount(container)
    await nextTick()

    expect(acg.event).toHaveBeenCalledWith('setup')
    expect(acg.log).not.toHaveBeenCalled()
  })

  it('onBeforeClose warns and blocks close (returns false)', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3' })
    app.mount(container)
    await nextTick()

    const result = capturedOptions.onBeforeClose()

    expect(acg.event).toHaveBeenCalledWith('Blocked Close Event')
    expect(acg.warn).toHaveBeenCalled()
    expect(result).toBe(false)
  })

  it('forwards onReady/onMessage/onResized via emit', async () => {
    const received = { onReady: [], onMessage: [], onResized: [] }

    // Vue converts emit('onReady') to handler prop 'onOnReady'
    app = createApp(IframeResizer, {
      license: 'GPLv3',
      onOnReady: (...args) => received.onReady.push(args),
      onOnMessage: (...args) => received.onMessage.push(args),
      onOnResized: (...args) => received.onResized.push(args),
    })
    app.mount(container)
    await nextTick()

    capturedOptions.onReady('r')
    capturedOptions.onMessage('m')
    capturedOptions.onResized('s')

    expect(received.onReady).toEqual([['r']])
    expect(received.onMessage).toEqual([['m']])
    expect(received.onResized).toEqual([['s']])
  })
})
