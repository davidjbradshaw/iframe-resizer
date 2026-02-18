/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('./console', () => ({
  log: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
}))
vi.mock('./events/resize', () => ({ default: vi.fn() }))

// Minimal settings structure
vi.mock('./values/settings', () => ({
  default: {
    x: { lastMessage: 'last', firstRun: false, initialised: false },
  },
}))

// Import after mocks
import routeMessage from './router'
import * as coreConsole from './console'
import resizeIframe from './events/resize'

describe('core/router default branches', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    coreConsole.log.mockClear()
    coreConsole.warn.mockClear()
    coreConsole.info.mockClear()
    resizeIframe.mockClear()
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true,
    })
  })

  it('warns and returns when width and height are zero', () => {
    routeMessage({ id: 'x', type: 'UNKNOWN', width: 0, height: 0 })
    expect(coreConsole.warn).toHaveBeenCalled()
    expect(resizeIframe).not.toHaveBeenCalled()
  })

  it('logs and returns when one dimension is zero', () => {
    routeMessage({ id: 'x', type: 'UNKNOWN', width: 0, height: 10 })
    expect(coreConsole.log).toHaveBeenCalledWith(
      'x',
      'Ignoring message with 0 height or width',
    )
    expect(resizeIframe).not.toHaveBeenCalled()
  })

  it('logs and returns when document is hidden', () => {
    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true,
    })
    routeMessage({ id: 'x', type: 'UNKNOWN', width: 10, height: 10 })
    expect(coreConsole.log).toHaveBeenCalledWith(
      'x',
      'Page hidden - ignored resize request',
    )
    expect(resizeIframe).not.toHaveBeenCalled()
  })

  it('calls resizeIframe for unknown type when visible and non-zero', () => {
    routeMessage({ id: 'x', type: 'UNKNOWN', width: 10, height: 10 })
    expect(resizeIframe).toHaveBeenCalled()
  })
})
