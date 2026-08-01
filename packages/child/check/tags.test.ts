import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import state from '../values/state'
import checkAndSetupTags from './tags'

describe('child/check/tags', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('collects elements with data-iframe-resize and logs state', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})

    const el1 = document.createElement('div')
    el1.dataset.iframeResize = ''
    const el2 = document.createElement('div')
    el2.dataset.iframeResize = ''
    document.body.append(el1, el2)

    checkAndSetupTags()

    expect(Array.isArray(state.taggedElements)).toBe(false) // NodeList
    expect(state.hasTags).toBe(true)
    expect(childConsole.log).toHaveBeenCalled()
  })

  it('sets hasTags to false when no tagged elements exist', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})

    checkAndSetupTags()

    expect(state.hasTags).toBe(false)
  })
})
