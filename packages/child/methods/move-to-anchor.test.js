import { beforeEach, describe, expect, it, vi } from 'vitest'

import state from '../values/state'
import moveToAnchor from './move-to-anchor'

describe('child/methods/move-to-anchor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    state.inPageLinks = { findTarget: vi.fn() }
  })

  it('calls findTarget with the provided anchor', () => {
    moveToAnchor('section-1')
    expect(state.inPageLinks.findTarget).toHaveBeenCalledWith('section-1')
  })

  it('throws TypeError when anchor is not a string', () => {
    expect(() => moveToAnchor(123)).toThrowError(TypeError)
  })
})
