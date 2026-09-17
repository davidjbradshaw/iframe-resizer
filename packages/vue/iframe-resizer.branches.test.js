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
  endAutoGroup: vi.fn(),
}
vi.mock('auto-console-group', () => ({
  default: () => acg,
}))

import { createApp, h, nextTick, ref } from 'vue'
import IframeResizer from './iframe-resizer.vue'
import connectResizer from '@iframe-resizer/core'

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

  it('calls consoleGroup.expand(true) when log="expanded"', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3', log: 'expanded' })
    app.mount(container)
    await nextTick()

    expect(acg.expand).toHaveBeenCalledWith(true)
  })

  it('re-binds with the new options when a prop changes', async () => {
    const bodyBackground = ref()
    app = createApp({
      setup: () => () =>
        h(IframeResizer, {
          license: 'GPLv3',
          bodyBackground: bodyBackground.value,
        }),
    })
    app.mount(container)
    await nextTick()

    expect(connectResizer).toHaveBeenCalledTimes(1)

    bodyBackground.value = 'rgb(0, 128, 0)'
    await nextTick()

    expect(connectResizer).toHaveBeenCalledTimes(2)
    expect(capturedOptions.bodyBackground).toBe('rgb(0, 128, 0)')
  })

  it('calls consoleGroup.expand(true) when log=LOG_EXPANDED (2)', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3', log: 2 })
    app.mount(container)
    await nextTick()

    expect(acg.expand).toHaveBeenCalledWith(true)
  })

  it('calls consoleGroup.expand(false) when log=true', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3', log: true })
    app.mount(container)
    await nextTick()

    expect(acg.expand).toHaveBeenCalledWith(false)
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
