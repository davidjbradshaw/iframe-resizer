import { describe, test, expect, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../send/size', () => ({ default: vi.fn() }))
vi.mock('../values/state', () => ({ default: { isHidden: false } }))

const { log } = await import('../console')
const sendSize = (await import('../send/size')).default
const state = (await import('../values/state')).default
const visibilityChange = (await import('./visibility')).default

describe('child/observed/visibility', () => {
  test('logs, updates state, and sends size', () => {
    visibilityChange(true)
    expect(log).toHaveBeenCalled()
    expect(state.isHidden).toBe(false)
    expect(sendSize).toHaveBeenCalled()
  })
})
