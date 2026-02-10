import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import checkIgnoredElements from './ignored-elements'

describe('child/check/ignored-elements', () => {
  it('warns when ignored elements count changes and returns true', () => {
    vi.spyOn(childConsole, 'warn').mockImplementation(() => {})
    const el1 = document.createElement('div')
    el1.dataset.iframeIgnore = ''
    const el2 = document.createElement('span')
    el2.dataset.iframeIgnore = ''
    document.body.append(el1, el2)

    const hasIgnored = checkIgnoredElements()

    expect(hasIgnored).toBe(true)
    expect(childConsole.warn).toHaveBeenCalled()
  })

  it('does not warn again when count is unchanged', () => {
    vi.spyOn(childConsole, 'warn').mockImplementation(() => {})
    // Elements already present from previous test; call again
    const hasIgnored = checkIgnoredElements()

    expect(hasIgnored).toBe(true)
    // Count unchanged, should not warn again
    expect(childConsole.warn).not.toHaveBeenCalled()
  })
})
