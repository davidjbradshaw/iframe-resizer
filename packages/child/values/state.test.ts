import { describe, expect, it } from 'vitest'

import state from './state'

describe('child/values/state', () => {
  it('has reasonable defaults and references', () => {
    expect(state.firstRun).toBe(true)
    expect(state.overflowedNodeSet instanceof Set).toBe(true)
    expect(state.win).toBe(window)
    expect(typeof state.inPageLinks).toBe('object')
  })
})
