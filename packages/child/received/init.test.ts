import { MESSAGE_ID_LENGTH } from '@iframe-resizer/common/consts'
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

const mockSendSize = vi.fn()
vi.mock('../send/size', () => ({ default: mockSendSize }))

const mockApply = vi.fn()
vi.mock('./update', () => ({ applyFromParent: mockApply }))

const mockSettings: Record<string, any> = { mode: 0 }
vi.mock('../values/settings', () => ({ default: mockSettings }))

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
    mockSendSize.mockReset()
    mockApply.mockReset()
    delete mockSettings.bindId
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
      mockState.target = parentWindow
      mockSettings.bindId = '1'
    })

    it('applies the new options and replies as at init', async () => {
      const mod = await import('./init')
      const data = initWith('2')

      mod.default({ data, source: parentWindow, origin: 'ori' })

      expect(mockApply).toHaveBeenCalledWith(
        data.slice(MESSAGE_ID_LENGTH).split(':'),
      )
      expect(mockResume).toHaveBeenCalled()
      expect(mockSendSize).toHaveBeenCalledWith(
        'init',
        'Init message from host page',
        undefined,
        undefined,
        expect.stringMatching(/:0$/),
      )
      expect(mockInit).not.toHaveBeenCalled()
      expect(mockState.target).toBe(parentWindow)
    })

    it('applies the new options passed directly by a same-origin parent', async () => {
      const mod = await import('./init')

      mod.default({ data: initWith('2'), sameOrigin: true })

      expect(mockApply).toHaveBeenCalled()
      expect(mockSendSize).toHaveBeenCalled()
    })

    it('ignores a repeat of the init it was set up with', async () => {
      const mod = await import('./init')

      mod.default({ data: initWith('1'), source: parentWindow, origin: 'ori' })

      expect(mockApply).not.toHaveBeenCalled()
      expect(mockSendSize).not.toHaveBeenCalled()
    })

    it('ignores an init without a binding number, from an older parent', async () => {
      const mod = await import('./init')

      mod.default({ data: initWith(), source: parentWindow, origin: 'ori' })

      expect(mockApply).not.toHaveBeenCalled()
      expect(mockSendSize).not.toHaveBeenCalled()
    })

    it('ignores a new binding number from another window above the page', async () => {
      const mod = await import('./init')

      mod.default({ data: initWith('2'), source: topWindow, origin: 'ori' })

      expect(mockApply).not.toHaveBeenCalled()
      expect(mockState.target).toBe(parentWindow)
    })
  })
})
