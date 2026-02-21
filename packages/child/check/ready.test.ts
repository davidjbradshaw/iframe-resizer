import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('child/check/ready', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls isolateUserCode immediately when document.readyState is complete', async () => {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'complete',
    })
    vi.doMock('../../common/utils', () => ({
      isolateUserCode: vi.fn((fn) => fn()),
    }))
    vi.doMock('../events/listeners', () => ({
      addEventListener: vi.fn(() => {}),
    }))
    vi.resetModules()
    const { default: checkReadyYet } = await import('./ready')
    const cb = vi.fn()
    checkReadyYet(cb)
    const mockedUtils = await import('../../common/utils')
    const mockedListeners = await import('../events/listeners')

    expect(mockedUtils.isolateUserCode).toHaveBeenCalledWith(cb)
    expect(mockedListeners.addEventListener).not.toHaveBeenCalled()
  })

  it('adds listener when not complete and not previously checked', async () => {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'interactive',
    })
    vi.doMock('../../common/utils', () => ({
      isolateUserCode: vi.fn((fn) => fn()),
    }))
    vi.doMock('../events/listeners', () => ({
      addEventListener: vi.fn(() => {}),
    }))
    vi.resetModules()
    const { default: checkReadyYet } = await import('./ready')
    const cb = vi.fn()
    checkReadyYet(cb)
    const mockedListeners = await import('../events/listeners')

    expect(mockedListeners.addEventListener).toHaveBeenCalled()
  })

  it('triggers recursive call when event listener is invoked', async () => {
    let readyStateValue = 'interactive'
    let eventCallback = null

    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => readyStateValue,
    })
    vi.doMock('../../common/utils', () => ({
      isolateUserCode: vi.fn((fn) => fn()),
    }))
    vi.doMock('../events/listeners', () => ({
      addEventListener: vi.fn((doc, event, callback) => {
        eventCallback = callback
      }),
    }))
    vi.resetModules()
    const { default: checkReadyYet } = await import('./ready')
    const mockedUtils = await import('../../common/utils')
    const cb = vi.fn()

    checkReadyYet(cb)

    // Simulate readyState change to 'complete' and trigger the event callback
    readyStateValue = 'complete'
    eventCallback()

    expect(mockedUtils.isolateUserCode).toHaveBeenCalledWith(cb)
  })

  it('does not add listener on subsequent calls when already checked', async () => {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'interactive',
    })
    vi.doMock('../../common/utils', () => ({
      isolateUserCode: vi.fn((fn) => fn()),
    }))
    vi.doMock('../events/listeners', () => ({
      addEventListener: vi.fn(() => {}),
    }))
    vi.resetModules()
    const { default: checkReadyYet } = await import('./ready')
    const mockedListeners = await import('../events/listeners')
    const cb = vi.fn()

    checkReadyYet(cb)
    expect(mockedListeners.addEventListener).toHaveBeenCalledTimes(1)

    // Second call should not add listener again
    checkReadyYet(cb)
    expect(mockedListeners.addEventListener).toHaveBeenCalledTimes(1)
  })
})
