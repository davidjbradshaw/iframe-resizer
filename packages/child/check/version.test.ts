import { beforeEach, describe, expect, it, vi } from 'vitest'

import { VERSION } from '../../common/consts'
import * as childConsole from '../console'
import checkVersion from './version'

describe('child/check/version', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
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
