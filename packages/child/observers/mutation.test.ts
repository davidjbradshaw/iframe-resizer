import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as consoleMod from '../console'
import {
  addedMutation,
  addedNodes,
  createProcessMutations,
  logMutations,
  newMutations,
  removedAddedNodes,
  removedMutation,
  removedNodes,
  shouldSkip,
} from './mutation'

vi.mock('../console', () => ({
  debug: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
}))

vi.mock('./utils', () => ({
  metaCreateDebugObserved: () => () => vi.fn(),
}))

function makeMutation(
  added: Node[] = [],
  removed: Node[] = [],
): MutationRecord {
  return {
    addedNodes: added,
    removedNodes: removed,
  } as unknown as MutationRecord
}

describe('child/observers/mutation units', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addedNodes.clear()
    removedNodes.clear()
    removedAddedNodes.clear()
    newMutations.length = 0
  })

  describe('shouldSkip', () => {
    it('skips text nodes', () => {
      expect(shouldSkip(document.createTextNode('hi'))).toBe(true)
    })

    it('skips ignored tags (script)', () => {
      expect(shouldSkip(document.createElement('script'))).toBe(true)
    })

    it('does not skip regular elements', () => {
      expect(shouldSkip(document.createElement('div'))).toBe(false)
    })
  })

  describe('addedMutation', () => {
    it('adds element nodes to the set', () => {
      const el = document.createElement('div')
      addedMutation(makeMutation([el]))
      expect(addedNodes.has(el)).toBe(true)
    })

    it('ignores text nodes', () => {
      addedMutation(makeMutation([document.createTextNode('x')]))
      expect(addedNodes.size).toBe(0)
    })
  })

  describe('removedMutation', () => {
    it('moves previously-added nodes to removedAddedNodes', () => {
      const el = document.createElement('div')
      addedNodes.add(el)

      removedMutation(makeMutation([], [el]))

      expect(addedNodes.has(el)).toBe(false)
      expect(removedAddedNodes.has(el)).toBe(true)
      expect(removedNodes.has(el)).toBe(false)
    })

    it('adds truly-removed nodes to removedNodes', () => {
      const el = document.createElement('div')
      removedMutation(makeMutation([], [el]))

      expect(removedNodes.has(el)).toBe(true)
      expect(removedAddedNodes.has(el)).toBe(false)
    })
  })

  describe('logMutations', () => {
    it('logs singular removed element', () => {
      removedNodes.add(document.createElement('div'))
      logMutations()
      expect(consoleMod.log).toHaveBeenCalledWith(
        expect.stringContaining('removed element'),
        expect.anything(),
        expect.anything(),
      )
      expect(consoleMod.log).toHaveBeenCalledWith(
        expect.not.stringContaining('elements'),
        expect.anything(),
        expect.anything(),
      )
    })

    it('logs plural removed elements', () => {
      removedNodes.add(document.createElement('div'))
      removedNodes.add(document.createElement('span'))
      logMutations()
      expect(consoleMod.log).toHaveBeenCalledWith(
        expect.stringContaining('removed elements'),
        expect.anything(),
        expect.anything(),
      )
    })

    it('logs singular new element', () => {
      addedNodes.add(document.createElement('div'))
      logMutations()
      expect(consoleMod.log).toHaveBeenCalledWith(
        expect.stringContaining('new element'),
        expect.anything(),
        expect.anything(),
      )
    })

    it('logs plural new elements', () => {
      addedNodes.add(document.createElement('div'))
      addedNodes.add(document.createElement('span'))
      logMutations()
      expect(consoleMod.log).toHaveBeenCalledWith(
        expect.stringContaining('new elements'),
        expect.anything(),
        expect.anything(),
      )
    })

    it('does not log when sets are empty', () => {
      logMutations()
      expect(consoleMod.log).not.toHaveBeenCalled()
    })
  })

  describe('createProcessMutations', () => {
    it('processes queued mutations and calls callback', () => {
      vi.spyOn(performance, 'now').mockReturnValue(0)

      const callback = vi.fn()
      const process = createProcessMutations(callback)
      const el = document.createElement('div')

      newMutations.push([makeMutation([el])])
      process()

      expect(callback).toHaveBeenCalled()
      expect(newMutations).toHaveLength(0)

      performance.now.mockRestore()
    })

    // Throttle tests are in mutation.deeper.test.ts (require module-level processMutations)
  })
})
