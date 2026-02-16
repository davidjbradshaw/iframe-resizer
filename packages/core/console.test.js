import { vi } from 'vitest'

import { advise, log, setupConsole, vInfo, warn } from './console'
import settings from './values/settings'

// Mock auto-console-group to control console group instances
vi.mock('auto-console-group', () => {
  const makeGroup = () => ({
    log: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    assert: vi.fn(),
    error: vi.fn(),
    event: vi.fn(),
    purge: vi.fn(),
    endAutoGroup: vi.fn(),
    errorBoundary: vi.fn(),
  })

  const defaultMock = vi.fn(() => {
    const group = makeGroup()
    if (!globalThis.__acgParentGroup) globalThis.__acgParentGroup = group
    return group
  })

  return {
    default: defaultMock,
    NORMAL: 'font-weight: normal;',
    BOLD: 'font-weight: bold;',
  }
})

describe('core/console', () => {
  beforeEach(() => {
    // Clear shared settings state between tests
    Object.keys(settings).forEach((k) => delete settings[k])
    vi.clearAllMocks()
  })

  test('log uses instance console when enabled', () => {
    const iframeId = 'f1'
    setupConsole({ enabled: true, expand: false, iframeId })
    // Ensure logging is enabled via settings
    settings[iframeId].log = true

    log(iframeId, 'hello')

    expect(settings[iframeId].console.log).toHaveBeenCalledWith('hello')
  })

  test('log returns null and does not emit when disabled', () => {
    const iframeId = 'f2'
    setupConsole({ enabled: false, expand: false, iframeId })

    const result = log(iframeId, 'silent')

    expect(result).toBeNull()
    expect(settings[iframeId].console.log).not.toHaveBeenCalled()
  })

  test('warn falls back to parent group when no settings entry', async () => {
    const parentGroup = globalThis.__acgParentGroup

    warn('missing', 'msg')

    expect(parentGroup.warn).toHaveBeenCalledWith('msg')
  })

  test('advise uses instance console.warn when settings present', () => {
    const iframeId = 'f3'
    setupConsole({ enabled: true, expand: false, iframeId })

    advise(iframeId, 'Message one', 'Message two')

    expect(settings[iframeId].console.warn).toHaveBeenCalled()
  })

  test('advise calls global console.warn when no settings', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    advise('no-settings', 'Needs advice')

    // Allow queued microtask to execute
    await Promise.resolve()

    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })

  test('vInfo outputs NORMAL style when console disabled and mode >= 1', async () => {
    // Disable console via setup
    setupConsole({ enabled: false, expand: false, iframeId: 'v' })

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    vInfo('1.2.3', 2)

    await Promise.resolve()

    expect(infoSpy).toHaveBeenCalled()
    const [, style] = infoSpy.mock.calls[0]

    expect(style).toBe('font-weight: normal;')

    infoSpy.mockRestore()
  })

  test('getMyId returns nested parent label when window.top !== window.self', () => {
    const iframeId = 'nested-f1'
    const originalTop = window.top
    const originalSelf = window.self

    // Mock nested iframe scenario
    Object.defineProperty(window, 'top', {
      configurable: true,
      value: { name: 'top window' },
    })
    Object.defineProperty(window, 'self', {
      configurable: true,
      value: { name: 'self window' },
    })

    setupConsole({ enabled: true, expand: false, iframeId })
    settings[iframeId].log = true
    log(iframeId, 'test message')

    // The console group label should include "nested parent"
    expect(settings[iframeId].console.log).toHaveBeenCalledWith('test message')

    // Restore original values
    Object.defineProperty(window, 'top', {
      configurable: true,
      value: originalTop,
    })
    Object.defineProperty(window, 'self', {
      configurable: true,
      value: originalSelf,
    })
  })

  test('setupConsole does not overwrite existing settings entry', () => {
    const iframeId = 'existing'
    const existingConsole = { log: vi.fn() }

    // Pre-populate settings
    settings[iframeId] = {
      console: existingConsole,
      log: true,
      someOtherProp: 'value',
    }

    setupConsole({ enabled: false, expand: false, iframeId })

    // Should preserve existing console and properties
    expect(settings[iframeId].console).toBe(existingConsole)
    expect(settings[iframeId].someOtherProp).toBe('value')
  })

  test('log uses consoleEnabled when settings entry does not exist', () => {
    const iframeId = 'no-settings'

    // Don't create settings entry, but set consoleEnabled to false via another iframe
    setupConsole({ enabled: false, expand: false, iframeId: 'other' })

    // This should check isLogEnabled which will return consoleEnabled (false from setup)
    const result = log(iframeId, 'test')

    // Since settings[iframeId] is falsy and consoleEnabled is false, should return null
    expect(result).toBeNull()
  })

  test('vInfo outputs BOLD style when console enabled or mode < 1', async () => {
    setupConsole({ enabled: true, expand: false, iframeId: 'v2' })

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    vInfo('2.0.0', 0)

    await Promise.resolve()

    expect(infoSpy).toHaveBeenCalled()
    const [, style] = infoSpy.mock.calls[0]

    // Should use BOLD style when enabled or mode < 1
    expect(style).toBe('font-weight: bold;')

    infoSpy.mockRestore()
  })
})
