import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

it('exports factory result', async () => {
  vi.mock('./factory', () => ({ default: vi.fn(() => vi.fn()) }))

  const mod = await import('./umd')

  expect(mod.default).toBeTypeOf('function')
})
