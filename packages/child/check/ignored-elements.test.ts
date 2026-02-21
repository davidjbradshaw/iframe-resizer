import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import checkIgnoredElements from './ignored-elements'

describe('child/check/ignored-elements', () => {
  beforeEach(() => {
    // Ensure clean DOM and fresh spies between tests
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('returns false when no ignored elements exist', () => {
    expect(checkIgnoredElements()).toBe(false)
  })

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
    // Setup elements and call twice within the same test
    const el1 = document.createElement('div')
    el1.dataset.iframeIgnore = ''
    const el2 = document.createElement('span')
    el2.dataset.iframeIgnore = ''
    document.body.append(el1, el2)

    const first = checkIgnoredElements()
    const callsAfterFirst = childConsole.warn.mock.calls.length
    const second = checkIgnoredElements()
    const callsAfterSecond = childConsole.warn.mock.calls.length

    expect(first).toBe(true)
    expect(second).toBe(true)
    // Second call must not increase warn count
    expect(callsAfterSecond).toBe(callsAfterFirst)
  })
})
