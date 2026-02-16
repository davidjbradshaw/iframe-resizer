import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import state from '../values/state'
import checkOverflow, { filterIgnoredElements } from './overflow'

describe('child/check/overflow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('returns empty set and no overflow when no elements present', () => {
    const { overflowedNodeSet, hasOverflowUpdated } = checkOverflow()

    expect(overflowedNodeSet.size).toBe(0)
    expect(state.hasOverflow).toBe(false)
    expect(typeof hasOverflowUpdated).toBe('boolean')
  })

  it('filterIgnoredElements removes nodes within ignored ancestors and logs', async () => {
    vi.spyOn(childConsole, 'event').mockImplementation(() => {})
    vi.spyOn(childConsole, 'info').mockImplementation(() => {})
    vi.spyOn(childConsole, 'endAutoGroup').mockImplementation(() => {})

    const ignored = document.createElement('div')
    ignored.dataset.iframeIgnore = ''
    const child = document.createElement('div')
    ignored.append(child)
    document.body.append(ignored)

    const set = filterIgnoredElements([child])

    expect(set.size).toBe(0)

    // Allow queued microtask to run
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    expect(childConsole.event).toHaveBeenCalledWith('overflowIgnored')
    expect(childConsole.info).toHaveBeenCalled()
    expect(childConsole.endAutoGroup).toHaveBeenCalled()
  })

  it('checkOverflow updates state and returns data', () => {
    const el = document.createElement('div')
    el.dataset.iframeOverflowed = ''
    document.body.append(el)

    const { hasOverflowUpdated, overflowedNodeSet } = checkOverflow()

    expect(overflowedNodeSet).toBeInstanceOf(Set)
    expect(state.hasOverflow).toBe(true)
    // Safari method might not exist; hasOverflowUpdated can be false
    expect(typeof hasOverflowUpdated).toBe('boolean')
  })
})
