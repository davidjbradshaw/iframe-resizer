import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies with factory style to satisfy Vitest v4
vi.mock('../console', () => ({
  log: vi.fn(),
}))

const mockInit = vi.fn()
vi.mock('../init', () => ({ default: mockInit }))

const mockState = { target: null, origin: null, firstRun: true, initLock: true }
vi.mock('../values/state', () => ({ default: mockState }))

describe('child/received/init', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockInit.mockReset()
    mockState.target = null
    mockState.origin = null
    mockState.firstRun = true
    mockState.initLock = true
  })

  it('ignores init when document is loading', async () => {
    const { log } = await import('../console')
    const mod = await import('./init')

    const original = Object.getOwnPropertyDescriptor(document, 'readyState')
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      configurable: true,
    })

    mod.default({ data: 'prefix:any', source: 'src', origin: 'ori' })
    expect(log).toHaveBeenCalledWith('Page not ready, ignoring init message')

    if (original) Object.defineProperty(document, 'readyState', original)
  })

  it('processes init data when ready and updates state', async () => {
    const { MESSAGE_ID_LENGTH, SEPARATOR } = await import('../../common/consts')
    const mod = await import('./init')

    const original = Object.getOwnPropertyDescriptor(document, 'readyState')
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      configurable: true,
    })

    const payload = `${'X'.repeat(MESSAGE_ID_LENGTH)}a${SEPARATOR}b${SEPARATOR}c`
    const event = {
      data: payload,
      source: { id: 1 },
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

    if (original) Object.defineProperty(document, 'readyState', original)
  })
})
