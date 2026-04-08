import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  delete window.iframeResize
})

it('wires window.iframeResize via factory', async () => {
  vi.mock('./factory', () => ({ default: vi.fn(() => vi.fn()) }))

  await import('./iife')

  expect(typeof window.iframeResize).toBe('function')
})
