import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  delete window.iframeResize
  delete window.iFrameResize
})

it('wires window.iFrameResize to deprecate and delegate to iframeResize', async () => {
  vi.mock('../core/console', () => ({ deprecateFunction: vi.fn() }))
  vi.mock('./factory', () => ({ default: vi.fn(() => vi.fn()) }))

  await import('./iife')

  expect(typeof window.iframeResize).toBe('function')
  expect(typeof window.iFrameResize).toBe('function')

  const consoleMod = await import('../core/console')
  const factoryMod = await import('./factory')
  window.iFrameResize('a', 'b')
  expect(consoleMod.deprecateFunction).toHaveBeenCalled()
  expect(factoryMod.default).toHaveReturned()
  const impl = factoryMod.default.mock.results[0].value
  expect(impl).toHaveBeenCalledWith('a', 'b')
})
