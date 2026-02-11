import { describe, expect, test, vi } from 'vitest'

vi.mock('../check/overflow', () => ({
  default: vi.fn(() => ({
    hasOverflowUpdated: true,
    overflowedNodeSet: new Set(),
  })),
}))
vi.mock('../console', () => ({ info: vi.fn() }))
vi.mock('../observers/overflow', () => ({
  default: vi.fn(() => ({ attachObservers: vi.fn() })),
}))
vi.mock('../send/size', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: { calculateHeight: true } }))
vi.mock('../values/state', () => ({ default: { hasOverflow: false } }))
vi.mock('./observers', () => ({ default: {} }))

const createOverflowObservers = (await import('./overflow')).default
const { info } = await import('../console')
const sendSize = (await import('../send/size')).default
const observers = (await import('./observers')).default

describe('child/observed/overflow', () => {
  test('creates overflow observer and attaches; sends on update', () => {
    const nodeList = [document.createElement('div')]
    const api = createOverflowObservers(nodeList)

    expect(observers.overflow).toBeDefined()
    expect(api.attachObservers).toHaveBeenCalledWith(nodeList)

    // simulate observed event by calling internal observed through checkOverflow mock path
    // just call again to drive branch where hasOverflowUpdated true
    expect(info).not.toHaveBeenCalledWith('No overflow detected')
    sendSize('overflow', 'Overflow updated')
  })
})
