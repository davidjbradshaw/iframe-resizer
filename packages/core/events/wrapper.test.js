import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ warn: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: {
    id: {
      onMessage: 'nope',
      onBeforeClose: vi.fn(() => {
        throw new Error('boom')
      }),
      onScroll: vi.fn(() => {
        throw new Error('nope')
      }),
      onResized: vi.fn(() => 'success'),
    },
  },
}))

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

  test('catches errors for onScroll and warns', () => {
    const res = on('id', 'onScroll', {})

    expect(res).toBeNull()
    expect(warn).toHaveBeenCalled()
  })

  test('returns null when settings[iframeId] does not exist', () => {
    const res = on('nonexistent', 'onMessage', {})

    expect(res).toBeNull()
  })

  test('calls isolateUserCode for non-onBeforeClose/onScroll handlers', () => {
    const res = on('id', 'onResized', {})

    // isolateUserCode returns a setTimeout handle
    expect(typeof res).toBe('object')
  })
})
