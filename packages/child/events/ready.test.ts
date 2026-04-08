import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ event: vi.fn(), log: vi.fn() }))

describe('child/events/ready', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  test('posts CHILD_READY_MESSAGE once when firstRun and document ready', async () => {
    const state = (await import('../values/state')).default
    state.firstRun = true

    const parent = { postMessage: vi.fn() }
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: parent,
    })
    Object.defineProperty(window, 'top', { configurable: true, value: parent })

    const { default: ready } = await import('./ready')
    ready()

    expect(parent.postMessage).toHaveBeenCalledTimes(1)
    // subsequent call should be ignored due to internal sent flag
    ready()

    expect(parent.postMessage).toHaveBeenCalledTimes(1)
  })

  test('posts to each origin when targetOrigin is an array', async () => {
    vi.resetModules()
    const state = (await import('../values/state')).default
    state.firstRun = true

    window.iframeResizer = { targetOrigin: ['https://a.com', 'https://b.com'] }

    const parent = { postMessage: vi.fn() }
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: parent,
    })
    Object.defineProperty(window, 'top', { configurable: true, value: parent })

    const { default: ready } = await import('./ready')
    ready()

    expect(parent.postMessage).toHaveBeenCalledTimes(2)
    expect(parent.postMessage).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      'https://a.com',
    )
    expect(parent.postMessage).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      'https://b.com',
    )

    window.iframeResizer = {}
  })

  test('posts CHILD_READY_MESSAGE to both parent and top when they differ', async () => {
    vi.resetModules()
    const state = (await import('../values/state')).default
    state.firstRun = true

    const parent = { postMessage: vi.fn() }
    const top = { postMessage: vi.fn() }
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: parent,
    })
    Object.defineProperty(window, 'top', { configurable: true, value: top })

    const { default: ready } = await import('./ready')
    ready()

    expect(parent.postMessage).toHaveBeenCalledTimes(1)
    expect(top.postMessage).toHaveBeenCalledTimes(1)
  })
})
