import connectResizer from '@iframe-resizer/core'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import IframeResizer from './index'

// Stable mock handles for auto-console-group
const mockGroupLabel = vi.fn()
const mockGroupEvent = vi.fn()
const mockGroupWarn = vi.fn()

vi.mock('auto-console-group', () => ({
  default: () => ({
    label: mockGroupLabel,
    event: mockGroupEvent,
    warn: mockGroupWarn,
    expand: vi.fn(),
    log: vi.fn(),
    endAutoGroup: vi.fn(),
  }),
}))

// Mock connectResizer
const disconnect = vi.fn()
const resize = vi.fn()
const moveToAnchor = vi.fn()
const sendMessage = vi.fn()

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => (iframe: any) => {
    iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
    return iframe.iframeResizer
  }),
}))

type DirectiveCallback = (
  el: HTMLIFrameElement,
  attributes: { expression: string },
  context: {
    evaluateLater: (
      expression: string,
    ) => (callback: (value: unknown) => void) => void
    effect: (fn: () => void) => void
    cleanup: (fn: () => void) => void
  },
) => void

function createMockAlpine(): {
  directive: ReturnType<typeof vi.fn>
  getCallback: () => DirectiveCallback | undefined
} {
  let registeredCallback: DirectiveCallback | undefined

  return {
    directive: vi.fn((name: string, callback: DirectiveCallback) => {
      registeredCallback = callback
    }),
    getCallback: () => registeredCallback,
  }
}

// Mimics Alpine's directive utilities: evaluateLater yields the current
// result, effect runs its callback at once (and again on rerunEffects, as
// Alpine would when reactive data read during evaluation changes).
function createMockContext(evaluateResult: unknown = {}): {
  evaluateLater: ReturnType<typeof vi.fn>
  effect: ReturnType<typeof vi.fn>
  cleanup: ReturnType<typeof vi.fn>
  runCleanup: () => void
  rerunEffects: (nextResult: unknown) => void
} {
  const cleanupFns: (() => void)[] = []
  const effectFns: (() => void)[] = []
  let result = evaluateResult

  return {
    evaluateLater: vi.fn(
      () => (callback: (value: unknown) => void) => callback(result),
    ),
    effect: vi.fn((fn: () => void) => {
      effectFns.push(fn)
      fn()
    }),
    cleanup: vi.fn((fn: () => void) => cleanupFns.push(fn)),
    runCleanup: () => cleanupFns.forEach((fn) => fn()),
    rerunEffects: (nextResult: unknown) => {
      result = nextResult
      effectFns.forEach((fn) => fn())
    },
  }
}

describe('Alpine IframeResizer plugin', () => {
  let mockIframe: HTMLIFrameElement

  beforeEach(() => {
    disconnect.mockClear()
    resize.mockClear()
    moveToAnchor.mockClear()
    sendMessage.mockClear()
    mockGroupLabel.mockClear()
    mockGroupEvent.mockClear()
    mockGroupWarn.mockClear()
    vi.mocked(connectResizer).mockClear()

    mockIframe = document.createElement('iframe')
    mockIframe.id = 'test-iframe'
    document.body.append(mockIframe)
  })

  test('plugin registers iframe-resizer directive', () => {
    const mockAlpine = createMockAlpine()

    IframeResizer(mockAlpine as any)

    expect(mockAlpine.directive).toHaveBeenCalledWith(
      'iframe-resizer',
      expect.any(Function),
    )
  })

  test('directive calls connectResizer on element mount', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext({ license: 'TEST' })

    callback(mockIframe, { expression: 'options' }, ctx)

    expect(connectResizer).toHaveBeenCalled()
  })

  test('directive calls disconnect on cleanup', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext({ license: 'TEST' })

    callback(mockIframe, { expression: 'options' }, ctx)
    ctx.runCleanup()

    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  test('directive passes options to connectResizer', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext({
      license: 'TEST-KEY',
      log: true,
      inPageLinks: true,
    })

    callback(mockIframe, { expression: 'opts' }, ctx)

    const capturedOptions = vi.mocked(connectResizer).mock.calls[0][0] as any
    expect(capturedOptions.license).toBe('TEST-KEY')
    expect(capturedOptions.log).toBe(true)
    expect(capturedOptions.inPageLinks).toBe(true)
  })

  test('directive handles null evaluate result gracefully', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext(null)

    callback(mockIframe, { expression: 'nullOptions' }, ctx)

    expect(connectResizer).toHaveBeenCalled()
    expect(mockGroupWarn).not.toHaveBeenCalled()
  })

  test('directive handles undefined evaluate result gracefully without warning', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext()

    callback(mockIframe, { expression: 'undefinedOptions' }, ctx)

    expect(connectResizer).toHaveBeenCalled()
    expect(mockGroupWarn).not.toHaveBeenCalled()
  })

  test('directive warns and falls back to empty options when expression returns a non-object', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext('not-an-object')

    callback(mockIframe, { expression: 'badExpr' }, ctx)

    expect(connectResizer).toHaveBeenCalled()
    expect(mockGroupWarn).toHaveBeenCalledWith(
      expect.stringContaining('must evaluate to an options object'),
    )
  })

  test('directive uses empty options when expression is empty', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext()

    callback(mockIframe, { expression: '' }, ctx)

    expect(connectResizer).toHaveBeenCalled()
  })

  test('directive registers cleanup handler', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext()

    callback(mockIframe, { expression: '' }, ctx)

    expect(ctx.cleanup).toHaveBeenCalledWith(expect.any(Function))
  })

  test('directive labels console group with iframe id on setup', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext()

    callback(mockIframe, { expression: '' }, ctx)

    expect(mockGroupLabel).toHaveBeenCalledWith('alpine(test-iframe)')
    expect(mockGroupEvent).toHaveBeenCalledWith('setup')
  })

  test('onBeforeClose returns false and warns via consoleGroup', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext()

    let capturedOptions: any
    vi.mocked(connectResizer).mockImplementationOnce((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    callback(mockIframe, { expression: '' }, ctx)

    const result = capturedOptions.onBeforeClose()

    expect(result).toBe(false)
    expect(mockGroupEvent).toHaveBeenCalledWith('close')
    expect(mockGroupWarn).toHaveBeenCalledWith(
      expect.stringContaining('Close event ignored'),
    )
  })

  test('directive evaluates expression via Alpine evaluateLater inside an effect', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext({ license: 'GPLv3' })

    callback(mockIframe, { expression: 'iframeOptions()' }, ctx)

    expect(ctx.evaluateLater).toHaveBeenCalledWith('iframeOptions()')
    expect(ctx.effect).toHaveBeenCalledTimes(1)
  })

  // Alpine attaches the directive after Alpine.start(), which can be after a
  // same-origin iframe has already loaded. waitForLoad would then suppress the
  // init sent on attach and the child would never initialise.
  test('directive does not set waitForLoad', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext({})

    callback(mockIframe, { expression: 'opts' }, ctx)

    const capturedOptions = vi.mocked(connectResizer).mock.calls[0][0] as any
    expect(capturedOptions.waitForLoad).toBeUndefined()
  })

  test('re-binds with the new options when reactive data changes', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext({ license: 'GPLv3' })

    callback(mockIframe, { expression: 'iframeOptions' }, ctx)
    expect(connectResizer).toHaveBeenCalledTimes(1)

    // Alpine re-runs the effect when data read during evaluation changes
    ctx.rerunEffects({ license: 'GPLv3', bodyBackground: 'rgb(0, 128, 0)' })

    expect(connectResizer).toHaveBeenCalledTimes(2)
    const updated = vi.mocked(connectResizer).mock.calls[1][0] as any
    expect(updated.bodyBackground).toBe('rgb(0, 128, 0)')
    expect(typeof updated.onBeforeClose).toBe('function')

    // Cleanup still disconnects the original binding once
    ctx.runCleanup()
    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
