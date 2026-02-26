import { describe, expect, test, vi } from 'vitest'

import { MUTATION_OBSERVER } from '../../common/consts'
import mutationObserved from './mutation'

vi.mock('../console', () => ({
  endAutoGroup: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
}))

vi.mock('../check/overflow', () => ({ default: vi.fn() }))
vi.mock('../check/tags', () => ({ default: vi.fn() }))

vi.mock('../values/state', () => ({ default: { applySelectors: vi.fn() } }))

vi.mock('./observers', () => {
  const attachObservers = vi.fn()
  const attachObserverToNonStaticElements = vi.fn()
  const detachObservers = vi.fn()
  return {
    default: {
      overflow: { attachObservers, detachObservers },
      resize: { attachObserverToNonStaticElements, detachObservers },
    },
    attachObservers,
    attachObserverToNonStaticElements,
    detachObservers,
  }
})

vi.mock('../size/all', () => ({ getAllElements: vi.fn(() => []) }))

vi.mock('../send/size', () => ({ default: vi.fn() }))

describe('child/observed/mutation branches', () => {
  test('early returns when added/removed sets are empty', async () => {
    const mutations = { addedNodes: new Set(), removedNodes: new Set() }
    mutationObserved(mutations)

    const {
      attachObservers,
      attachObserverToNonStaticElements,
      detachObservers,
    } = await import('./observers')
    expect(attachObservers).not.toHaveBeenCalled()
    expect(attachObserverToNonStaticElements).not.toHaveBeenCalled()
    expect(detachObservers).not.toHaveBeenCalled()
    const { default: sendSize } = await import('../send/size')
    expect(sendSize).toHaveBeenCalledWith(
      MUTATION_OBSERVER,
      'Mutation Observed',
    )
  })

  test('adds and removes observers when sets have nodes', async () => {
    const nodeA = document.createElement('div')
    const nodeB = document.createElement('span')
    const { getAllElements } = await import('../size/all')
    getAllElements.mockImplementationOnce(() => [nodeB])

    const mutations = {
      addedNodes: new Set([nodeA]),
      removedNodes: new Set([nodeB]),
    }

    mutationObserved(mutations)

    const {
      attachObservers,
      attachObserverToNonStaticElements,
      detachObservers,
    } = await import('./observers')
    expect(attachObservers).toHaveBeenCalledTimes(1)
    expect(attachObserverToNonStaticElements).toHaveBeenCalledTimes(1)
    expect(detachObservers).toHaveBeenCalledTimes(2)
    const { default: sendSize } = await import('../send/size')
    expect(sendSize).toHaveBeenCalledWith(
      MUTATION_OBSERVER,
      'Mutation Observed',
    )
  })
})
