import { beforeEach, expect, it, vi } from 'vitest'

vi.mock('./factory', () => ({ default: vi.fn(() => () => 'X') }))

beforeEach(() => {
  vi.resetModules()
})

it('exports the factory result', async () => {
  const mod = await import('./esm')
  expect(typeof mod.default).toBe('function')
  expect(mod.default()).toBe('X')
})
