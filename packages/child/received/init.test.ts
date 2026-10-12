import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies with factory style to satisfy Vitest v4
vi.mock('../console', () => ({
  log: vi.fn(),
  warn: vi.fn(),
}))

const mockInit = vi.fn()
vi.mock('../init', () => ({ default: mockInit }))

const mockResume = vi.fn()
vi.mock('../methods/parent-props', () => ({ resumeParentProps: mockResume }))

const mockState = {
  target: null,
  origin: null,
  firstRun: true,
  initLock: true,
  testHarness: false,
}
vi.mock('../values/state', () => ({ default: mockState }))

// The page sits two iframes down: window -> parentWindow -> topWindow
const topWindow: any = {}
topWindow.parent = topWindow
const parentWindow = { parent: topWindow }

describe('child/received/init', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockInit.mockReset()
    mockResume.mockReset()
    mockState.target = null
    mockState.origin = null
    mockState.firstRun = true
    mockState.initLock = true
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: parentWindow,
    })
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      configurable: true,
    })
  })

  it('ignores init when document is loading', async () => {
    const { log } = await import('../console')
    const mod = await import('./init')

    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      configurable: true,
    })

    mod.default({ data: 'prefix:any', source: parentWindow, origin: 'ori' })
    expect(log).toHaveBeenCalledWith('Page not ready, ignoring init message')
    expect(mockInit).not.toHaveBeenCalled()
  })

  it('processes init data when ready and updates state', async () => {
    const { MESSAGE_ID_LENGTH, SEPARATOR } =
      await import('@iframe-resizer/common/consts')
    const mod = await import('./init')

    const payload = `${'X'.repeat(MESSAGE_ID_LENGTH)}a${SEPARATOR}b${SEPARATOR}c`
    const event = {
      data: payload,
      source: parentWindow,
      origin: 'https://example.test',
    }

    const timerSpy = vi.spyOn(global, 'setTimeout')
    mod.default(event)

    expect(mockState.target).toBe(event.source)
    expect(mockState.origin).toBe(event.origin)
    expect(mockInit).toHaveBeenCalledWith(['a', 'b', 'c'])
    expect(mockState.firstRun).toBe(false)
    expect(timerSpy).toHaveBeenCalled()

    // Execute timeout callback immediately for assertion
    timerSpy.mock.calls.at(-1)[0]()
    expect(mockState.initLock).toBe(false)
  })

  it('accepts init from a window above the parent, as on Google Apps Script', async () => {
    const mod = await import('./init')
    const event = { data: 'prefix:a:b', source: topWindow, origin: 'ori' }

    mod.default(event)

    expect(mockState.target).toBe(topWindow)
    expect(mockInit).toHaveBeenCalled()
  })

  it('ignores init from a window that is not above the page', async () => {
    const { warn } = await import('../console')
    const mod = await import('./init')
    const event = { data: 'prefix:a:b', source: {}, origin: 'ori' }

    mod.default(event)

    expect(mockState.target).toBeNull()
    expect(mockState.origin).toBeNull()
    expect(mockInit).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('init'))
  })

  it('accepts init passed directly by a same-origin parent', async () => {
    const mod = await import('./init')

    mod.default({ data: 'prefix:a:b', sameOrigin: true })

    expect(mockInit).toHaveBeenCalled()
  })

  it('ignores a second init, so the target cannot be changed', async () => {
    const mod = await import('./init')
    mockState.firstRun = false
    mockState.target = parentWindow

    mod.default({ data: 'prefix:a:b', source: topWindow, origin: 'ori' })

    expect(mockState.target).toBe(parentWindow)
    expect(mockInit).not.toHaveBeenCalled()
  })

  it('resumes getParentProps on a later init from the parent', async () => {
    const mod = await import('./init')
    mockState.firstRun = false

    mod.default({ data: 'prefix:a:b', source: parentWindow, origin: 'ori' })

    expect(mockResume).toHaveBeenCalled()
    expect(mockInit).not.toHaveBeenCalled()
  })

  it('does not resume getParentProps for a later init from another window', async () => {
    const mod = await import('./init')
    mockState.firstRun = false

    mod.default({ data: 'prefix:a:b', source: {}, origin: 'ori' })

    expect(mockResume).not.toHaveBeenCalled()
  })
})
