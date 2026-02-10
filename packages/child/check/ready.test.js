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
})
