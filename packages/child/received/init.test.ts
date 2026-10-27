import { MESSAGE_ID_LENGTH } from '@iframe-resizer/common/consts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies with factory style to satisfy Vitest v4
vi.mock('../console', () => ({
  log: vi.fn(),
  warn: vi.fn(),
}))

const mockInit = vi.fn()
vi.mock('../init', () => ({ default: mockInit }))

const mockResume = vi.fn(() => calls.push('resume'))
vi.mock('../methods/parent-props', () => ({ resumeParentProps: mockResume }))

const calls: string[] = []

const mockInitReply = vi.fn(() => calls.push('initReply'))
vi.mock('../send/init-reply', () => ({ default: mockInitReply }))

const mockSendAutoResize = vi.fn()
vi.mock('../methods/auto-resize', () => ({
  sendAutoResizeState: mockSendAutoResize,
}))

const mockResendTitle = vi.fn()
vi.mock('../observed/title', () => ({ resendTitle: mockResendTitle }))

const mockApply = vi.fn()
vi.mock('./update', () => ({ applyFromParent: mockApply }))

const mockSettings: Record<string, any> = { mode: 0 }
vi.mock('../values/settings', () => ({ default: mockSettings }))

const mockState: Record<string, any> = {
  target: null,
  origin: null,
  firstRun: true,
  started: false,
  fromParent: {},
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
    mockResume.mockClear()
    mockInitReply.mockClear()
    mockSendAutoResize.mockReset()
    mockResendTitle.mockReset()
    mockApply.mockReset()
    calls.length = 0
    delete mockSettings.bindId
    mockSettings.autoResize = true
    mockState.started = false
    mockState.fromParent = {}
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
    const { log } = await import('../console')
    vi.mocked(log).mockClear()
    const mod = await import('./init')
    mockState.firstRun = false
    mockResume.mockReturnValueOnce(true)

    mod.default({ data: 'prefix:a:b', source: parentWindow, origin: 'ori' })

    expect(mockResume).toHaveBeenCalled()
    expect(mockInit).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      'Already initialised, asking the parent for getParentProps() again',
    )
  })

  it('says a later init is ignored when there is nothing to resume', async () => {
    const { log } = await import('../console')
    vi.mocked(log).mockClear()
    const mod = await import('./init')
    mockState.firstRun = false
    mockResume.mockReturnValueOnce(false)

    mod.default({ data: 'prefix:a:b', source: parentWindow, origin: 'ori' })

    expect(log).toHaveBeenCalledWith(
      'Already initialised, ignoring init message',
    )
  })

  it('does not resume getParentProps for a later init from another window', async () => {
    const mod = await import('./init')
    mockState.firstRun = false

    mod.default({ data: 'prefix:a:b', source: {}, origin: 'ori' })

    expect(mockResume).not.toHaveBeenCalled()
  })

  describe('when the parent binds the iframe again', () => {
    // An init message whose field 25 is the parent's binding number
    const initWith = (bindId?: string) => {
      const fields = Array.from({ length: 25 }, (_, i) => `f${i}`)
      if (bindId !== undefined) fields.push(bindId)
      return `${'X'.repeat(MESSAGE_ID_LENGTH)}${fields.join(':')}`
    }

    beforeEach(() => {
      mockState.firstRun = false
      mockState.started = true
      mockState.target = parentWindow
      mockSettings.bindId = '1'
    })

    it('applies the new options and replies as at init, before anything else', async () => {
      const mod = await import('./init')
      const data = initWith('2')

      mod.default({ data, source: parentWindow, origin: 'ori' })

      // As a new binding, so the options send no size of their own
      expect(mockApply).toHaveBeenCalledWith(
        data.slice(MESSAGE_ID_LENGTH).split(':'),
        true,
      )
      expect(calls).toEqual(['initReply', 'resume'])
      expect(mockResendTitle).toHaveBeenCalled()
      expect(mockInit).not.toHaveBeenCalled()
      expect(mockState.target).toBe(parentWindow)
    })

    it('tells the new binding that the page turned autoResize off', async () => {
      const mod = await import('./init')
      mockSettings.autoResize = false
      mockState.fromParent = { autoResize: true }

      mod.default({ data: initWith('2'), source: parentWindow, origin: 'ori' })

      expect(mockSendAutoResize).toHaveBeenCalled()
    })

    it('says nothing of autoResize when the page left it as the parent set it', async () => {
      const mod = await import('./init')
      mockState.fromParent = { autoResize: true }

      mod.default({ data: initWith('2'), source: parentWindow, origin: 'ori' })

      expect(mockSendAutoResize).not.toHaveBeenCalled()
    })

    it('stays stopped when its first init failed the licence check', async () => {
      const mod = await import('./init')
      mockState.started = false

      mod.default({ data: initWith('2'), source: parentWindow, origin: 'ori' })

      expect(mockApply).not.toHaveBeenCalled()
      expect(mockInitReply).not.toHaveBeenCalled()
    })

    it('applies the new options passed directly by a same-origin parent', async () => {
      const mod = await import('./init')

      mod.default({ data: initWith('2'), sameOrigin: true })

      expect(mockApply).toHaveBeenCalled()
      expect(mockInitReply).toHaveBeenCalled()
    })

    it('ignores a repeat of the init it was set up with', async () => {
      const mod = await import('./init')

      mod.default({ data: initWith('1'), source: parentWindow, origin: 'ori' })

      expect(mockApply).not.toHaveBeenCalled()
      expect(mockInitReply).not.toHaveBeenCalled()
    })

    it('ignores an init without a binding number, from an older parent', async () => {
      const mod = await import('./init')

      mod.default({ data: initWith(), source: parentWindow, origin: 'ori' })

      expect(mockApply).not.toHaveBeenCalled()
      expect(mockInitReply).not.toHaveBeenCalled()
    })

    it('ignores a new binding number from another window above the page', async () => {
      const mod = await import('./init')

      mod.default({ data: initWith('2'), source: topWindow, origin: 'ori' })

      expect(mockApply).not.toHaveBeenCalled()
      expect(mockState.target).toBe(parentWindow)
    })
  })
})
