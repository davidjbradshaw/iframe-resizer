import { OVERFLOW_OBSERVER } from '@iframe-resizer/common/consts'
import { describe, expect, test, vi } from 'vitest'

let overflowCallback: () => void

vi.mock('../check/overflow', () => ({
  default: vi.fn(() => ({
    hasOverflowUpdated: true,
    overflowedNodeSet: new Set(),
  })),
}))
vi.mock('../console', () => ({ info: vi.fn() }))
vi.mock('../observers/overflow', () => ({
  default: vi.fn((cb) => {
    overflowCallback = cb
    return { attachObservers: vi.fn() }
  }),
}))
vi.mock('../send/size', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: { calculateHeight: true } }))
vi.mock('../values/state', () => ({ default: { hasOverflow: false } }))
vi.mock('./observers', () => ({ default: {} }))

const createOverflowObservers = (await import('./overflow')).default
const sendSize = (await import('../send/size')).default
const observers = (await import('./observers')).default

describe('child/observed/overflow', () => {
  test('creates overflow observer and attaches; sends on update', () => {
    const nodeList = [document.createElement('div')]
    const api = createOverflowObservers(nodeList)

    expect(observers.overflow).toBeDefined()
    expect(api.attachObservers).toHaveBeenCalledWith(nodeList)

    // invoke the callback the observer would trigger
    overflowCallback()

    expect(sendSize).toHaveBeenCalledWith(OVERFLOW_OBSERVER, 'Overflow updated')
  })
})
