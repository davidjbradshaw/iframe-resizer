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
})
