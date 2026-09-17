import { beforeEach, expect, it, vi } from 'vitest'

vi.mock('./factory', () => ({ default: vi.fn(() => vi.fn()) }))

beforeEach(() => {
  vi.resetModules()
  delete window.iframeResize
})

it('wires window.iframeResize via factory', async () => {
  await import('./iife')

  expect(typeof window.iframeResize).toBe('function')
})
