/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock core connect to expose options and simulate logExpand mutation
vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn((options) => {
    // simulate internal mutation performed by connectResizer
    // so consoleOptions.expand picks it up
    // eslint-disable-next-line no-param-reassign
    options.logExpand = true
    return () => ({
      options, // expose full options for test triggers
      moveToAnchor: vi.fn(),
      resize: vi.fn(),
      sendMessage: vi.fn(),
      disconnect: vi.fn(),
    })
  }),
}))

// Mock auto-console-group and capture spies
const acg = {
  event: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
}
vi.mock('auto-console-group', () => ({
  default: () => acg,
}))

const comp = (await import('./iframe-resizer.vue')).default

describe('Vue iframe-resizer branches', () => {
  let ctx
  beforeEach(() => {
    acg.event.mockClear()
    acg.log.mockClear()
    acg.warn.mockClear()

    const iframe = document.createElement('iframe')
    iframe.id = 'vue-1'
    document.body.append(iframe)
    ctx = {
      $refs: { iframe },
      $props: {},
      $emit: vi.fn(),
      resizer: null,
    }
  })

  it('does not log when props.log is -1 (no logging)', () => {
    ctx.$props.log = -1
    comp.mounted.call(ctx)
    expect(acg.event).toHaveBeenCalledWith('setup')
    expect(acg.log).not.toHaveBeenCalled()
  })

  it('does not log when props.log is false', () => {
    ctx.$props.log = false
    comp.mounted.call(ctx)
    expect(acg.event).toHaveBeenCalledWith('setup')
    expect(acg.log).not.toHaveBeenCalled()
  })

  it('onBeforeClose warns and blocks close (returns false)', () => {
    comp.mounted.call(ctx)
    const { onBeforeClose } = ctx.resizer.options
    const result = onBeforeClose()
    expect(acg.event).toHaveBeenCalledWith('Blocked Close Event')
    expect(acg.warn).toHaveBeenCalled()
    expect(result).toBe(false)
  })

  it('forwards onReady/onMessage/onResized via $emit', () => {
    comp.mounted.call(ctx)
    const { onReady, onMessage, onResized } = ctx.resizer.options
    onReady('r')
    onMessage('m')
    onResized('s')
    expect(ctx.$emit).toHaveBeenCalledWith('onReady', 'r')
    expect(ctx.$emit).toHaveBeenCalledWith('onMessage', 'm')
    expect(ctx.$emit).toHaveBeenCalledWith('onResized', 's')
  })
})
