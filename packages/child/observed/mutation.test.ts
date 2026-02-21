import { describe, expect, test, vi } from 'vitest'

vi.mock('../../common/consts', () => ({ MUTATION_OBSERVER: 'mutation' }))
vi.mock('../check/overflow', () => ({
  default: vi.fn(() => ({
    hasOverflowUpdated: true,
    overflowedNodeSet: new Set(),
  })),
}))
vi.mock('../check/tags', () => ({ default: vi.fn() }))
vi.mock('../console', () => ({
  endAutoGroup: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
}))
vi.mock('../send/size', () => ({ default: vi.fn() }))
vi.mock('../size/all', () => ({ getAllElements: vi.fn(() => []) }))
vi.mock('../values/state', () => ({ default: { applySelectors: vi.fn() } }))
vi.mock('./observers', () => ({
  default: {
    overflow: { attachObservers: vi.fn(), detachObservers: vi.fn() },
    resize: {
      attachObserverToNonStaticElements: vi.fn(),
      detachObservers: vi.fn(),
    },
  },
}))

// Removed unused consoleEvent variable assignment
const sendSize = (await import('../send/size')).default
const observers = (await import('./observers')).default
const mutationObserved = (await import('./mutation')).default

describe('child/observed/mutation', () => {
  test('handles content mutation and sends size', () => {
    const added = new Set([document.createElement('div')])
    const removed = new Set()
    mutationObserved({ addedNodes: added, removedNodes: removed })

    expect(observers.overflow.attachObservers).toHaveBeenCalled()
    expect(
      observers.resize.attachObserverToNonStaticElements,
    ).toHaveBeenCalled()

    expect(sendSize).toHaveBeenCalledWith('mutation', 'Mutation Observed')
  })
})
