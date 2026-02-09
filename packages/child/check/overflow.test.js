import { describe, it, expect, vi } from 'vitest'

import * as childConsole from '../console'
import checkOverflow, { filterIgnoredElements } from './overflow'
import state from '../values/state'

describe('child/check/overflow', () => {
  it('filterIgnoredElements removes nodes within ignored ancestors and logs', async () => {
    vi.spyOn(childConsole, 'event').mockImplementation(() => {})
    vi.spyOn(childConsole, 'info').mockImplementation(() => {})
    vi.spyOn(childConsole, 'endAutoGroup').mockImplementation(() => {})

    const ignored = document.createElement('div')
    ignored.setAttribute('data-iframe-ignore', '')
    const child = document.createElement('div')
    ignored.appendChild(child)
    document.body.append(ignored)

    const set = filterIgnoredElements([child])
    expect(set.size).toBe(0)

    // Allow queued microtask to run
    await new Promise((r) => setTimeout(r, 0))

    expect(childConsole.event).toHaveBeenCalledWith('overflowIgnored')
    expect(childConsole.info).toHaveBeenCalled()
    expect(childConsole.endAutoGroup).toHaveBeenCalled()
  })

  it('checkOverflow updates state and returns data', () => {
    const el = document.createElement('div')
    el.setAttribute('data-iframe-overflowed', '')
    document.body.append(el)

    const { hasOverflowUpdated, overflowedNodeSet } = checkOverflow()
    expect(overflowedNodeSet).toBeInstanceOf(Set)
    expect(state.hasOverflow).toBe(true)
    // Safari method might not exist; hasOverflowUpdated can be false
    expect(typeof hasOverflowUpdated).toBe('boolean')
  })
})
