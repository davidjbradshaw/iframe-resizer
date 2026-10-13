import { VERSION } from '@iframe-resizer/common/consts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import checkVersion, { isLegacyParent } from './version'

describe('child/check/version', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('isLegacyParent is true only when the parent sent no version', () => {
    expect(isLegacyParent()).toBe(true)
    expect(isLegacyParent('')).toBe(true)
    expect(isLegacyParent('false')).toBe(true)
    expect(isLegacyParent('5.5.9')).toBe(false)
  })

  it('advises legacy when version is missing or false', () => {
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    checkVersion({ version: undefined })
    checkVersion({ version: '' })
    checkVersion({ version: 'false' })

    expect(childConsole.advise).toHaveBeenCalled()
  })

  it('advises mismatch when version differs', () => {
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    checkVersion({ version: '0.0.0' })

    expect(childConsole.advise).toHaveBeenCalled()
  })

  it('does nothing when version matches', () => {
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    checkVersion({ version: VERSION })

    expect(childConsole.advise).not.toHaveBeenCalled()
  })
})
