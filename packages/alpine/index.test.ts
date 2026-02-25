import { beforeEach, describe, expect, test, vi } from 'vitest'

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

import IframeResizer from './index'
import connectResizer from '@iframe-resizer/core'

type DirectiveCallback = (
  el: HTMLIFrameElement,
  attributes: { expression: string },
  context: {
    evaluate: (expression: string) => unknown
    cleanup: (fn: () => void) => void
  },
) => void

function createMockAlpine() {
  let registeredCallback: DirectiveCallback | undefined

  const alpine = {
    directive: vi.fn((name: string, callback: DirectiveCallback) => {
      registeredCallback = callback
    }),
    getCallback: () => registeredCallback,
  }

  return alpine
}

function createMockContext(evaluateResult: unknown = {}) {
  const cleanupFns: (() => void)[] = []

  return {
    evaluate: vi.fn(() => evaluateResult),
    cleanup: vi.fn((fn: () => void) => cleanupFns.push(fn)),
    runCleanup: () => cleanupFns.forEach((fn) => fn()),
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

  test('directive evaluates expression via Alpine evaluate', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext({ license: 'GPLv3' })

    callback(mockIframe, { expression: 'iframeOptions()' }, ctx)

    expect(ctx.evaluate).toHaveBeenCalledWith('iframeOptions()')
  })

  test('directive sets waitForLoad option', () => {
    const mockAlpine = createMockAlpine()
    IframeResizer(mockAlpine as any)

    const callback = mockAlpine.getCallback()!
    const ctx = createMockContext({})

    callback(mockIframe, { expression: 'opts' }, ctx)

    const capturedOptions = vi.mocked(connectResizer).mock.calls[0][0] as any
    expect(capturedOptions.waitForLoad).toBe(true)
  })
})
