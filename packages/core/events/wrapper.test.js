import { describe, test, expect, vi } from 'vitest'

vi.mock('../console', () => ({ warn: vi.fn() }))
vi.mock('../values/settings', () => ({ default: { id: { onMessage: 'nope', onBeforeClose: vi.fn(() => { throw new Error('boom') }), onScroll: vi.fn(() => { throw new Error('nope') }) } } }))

const on = (await import('./wrapper')).default
const { warn } = await import('../console')

describe('core/events/wrapper', () => {
  test('throws when handler is not a function', () => {
    expect(() => on('id', 'onMessage', {})).toThrow(TypeError)
  })

  test('catches errors for onBeforeClose and warns', () => {
    const res = on('id', 'onBeforeClose', {})
    expect(res).toBeNull()
    expect(warn).toHaveBeenCalled()
  })
})
