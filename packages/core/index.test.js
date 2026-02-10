import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

it('throws TypeError when options is not an object', async () => {
  const { default: connectResizer } = await import('./index')
  expect(() => connectResizer(null)).toThrow(TypeError)
})

it('warns and returns existing api when already setup', async () => {
  vi.mock('./checks/id', () => ({ default: vi.fn(() => 'abc') }))
  vi.mock('./listeners', () => ({ default: vi.fn() }))
  vi.mock('./setup/logging', () => ({ default: vi.fn() }))
  vi.mock('./setup', () => ({ default: vi.fn() }))
  vi.mock('./console', () => {
    const errorBoundary = vi.fn(
      (_, fn) =>
        (...args) =>
          fn(...args),
    )
    const event = vi.fn()
    const warn = vi.fn()
    return { errorBoundary, event, warn }
  })

  const { default: connectResizer } = await import('./index')
  const consoleMod = await import('./console')
  const iframe = { iframeResizer: { api: true } }
  const fn = connectResizer({})
  const api = fn(iframe)

  expect(consoleMod.warn).toHaveBeenCalled()
  expect(api).toBe(iframe.iframeResizer)
})

it('sets up logging and wraps setupIframe via errorBoundary', async () => {
  vi.mock('./checks/id', () => ({ default: vi.fn(() => 'abc') }))
  vi.mock('./listeners', () => ({ default: vi.fn() }))
  vi.mock('./setup/logging', () => ({ default: vi.fn() }))
  vi.mock('./setup', () => ({
    default: vi.fn((iframe) => {
      iframe.iframeResizer = { ready: 1 }
    }),
  }))
  vi.mock('./console', () => {
    const errorBoundary = vi.fn(
      (_, fn) =>
        (...args) =>
          fn(...args),
    )
    const event = vi.fn()
    const warn = vi.fn()
    return { errorBoundary, event, warn }
  })

  const { default: connectResizer } = await import('./index')
  const loggingMod = await import('./setup/logging')
  const setupMod = await import('./setup')
  const options = { x: 1 }
  const fn = connectResizer(options)
  const iframe = {}
  const api = fn(iframe)

  expect(loggingMod.default).toHaveBeenCalledWith('abc', options)
  expect(setupMod.default).toHaveBeenCalled()
  expect(api).toEqual({ ready: 1 })
})
