import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

it('exports the factory result', async () => {
  vi.mock('./factory', () => ({ default: vi.fn(() => () => 'X') }))
  const mod = await import('./esm')
  expect(typeof mod.default).toBe('function')
  expect(mod.default()).toBe('X')
})
