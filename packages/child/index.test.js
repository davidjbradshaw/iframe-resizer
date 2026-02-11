import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  delete window.iframeChildListener
})

it('sets up child listener and adds event listeners', async () => {
  vi.mock('./events/listeners', () => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.mock('./events/ready', () => ({ default: vi.fn() }))
  vi.mock('./received', () => ({ default: vi.fn() }))
  vi.mock('./console', () => ({ event: vi.fn(), warn: vi.fn() }))

  await import('./index')

  const listeners = await import('./events/listeners')
  expect(typeof window.iframeChildListener).toBe('function')
  expect(listeners.addEventListener).toHaveBeenCalled()
})

it('warns when already setup', async () => {
  window.iframeChildListener = () => {}
  vi.mock('./console', () => ({ event: vi.fn(), warn: vi.fn() }))
  vi.mock('./events/listeners', () => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.mock('./events/ready', () => ({ default: vi.fn() }))
  vi.mock('./received', () => ({ default: vi.fn() }))

  await import('./index')
  const consoleMod = await import('./console')
  expect(consoleMod.warn).toHaveBeenCalled()
})
