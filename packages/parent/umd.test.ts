import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  delete window.iFrameResize
})

it('exports factory result and wires deprecating iFrameResize when window exists', async () => {
  vi.mock('../core/console', () => ({ deprecateFunction: vi.fn() }))
  vi.mock('./factory', () => ({ default: vi.fn(() => vi.fn()) }))

  const mod = await import('./umd')
  const factoryMod = await import('./factory')
  const consoleMod = await import('../core/console')

  expect(mod.default).toBeTypeOf('function')

  expect(typeof window.iFrameResize).toBe('function')
  window.iFrameResize('x')
  expect(consoleMod.deprecateFunction).toHaveBeenCalled()
  const impl = factoryMod.default.mock.results[0].value
  expect(impl).toHaveBeenCalledWith('x')
})

it('does not set window.iFrameResize when window is undefined', async () => {
  vi.resetModules()

  // Mock window as undefined
  const originalWindow = global.window
  delete global.window

  vi.mock('../core/console', () => ({ deprecateFunction: vi.fn() }))
  vi.mock('./factory', () => ({ default: vi.fn(() => vi.fn()) }))

  const mod = await import('./umd')

  expect(mod.default).toBeTypeOf('function')

  // Restore window
  global.window = originalWindow
})
