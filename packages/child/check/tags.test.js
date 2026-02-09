import { describe, it, expect, vi } from 'vitest'

import * as childConsole from '../console'
import checkAndSetupTags from './tags'
import state from '../values/state'

describe('child/check/tags', () => {
  it('collects elements with data-iframe-size and logs state', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})

    const el1 = document.createElement('div')
    el1.setAttribute('data-iframe-size', '')
    const el2 = document.createElement('div')
    el2.setAttribute('data-iframe-size', '')
    document.body.append(el1, el2)

    checkAndSetupTags()
    expect(Array.isArray(state.taggedElements)).toBe(false) // NodeList
    expect(state.hasTags).toBe(true)
    expect(childConsole.log).toHaveBeenCalled()
  })
})
