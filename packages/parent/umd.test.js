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
