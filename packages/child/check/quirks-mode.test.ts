import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import checkQuirksMode from './quirks-mode'

describe('child/check/quirks-mode', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('advises when document.compatMode is Quirks Mode', () => {
    vi.spyOn(document, 'compatMode', 'get').mockReturnValue('BackCompat')
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    checkQuirksMode()

    expect(childConsole.advise).toHaveBeenCalled()
  })

  it('does nothing in Standards Mode', () => {
    vi.spyOn(document, 'compatMode', 'get').mockReturnValue('CSS1Compat')
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    checkQuirksMode()

    expect(childConsole.advise).not.toHaveBeenCalled()
  })
})
