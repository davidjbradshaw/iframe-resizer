import { describe, it, expect, vi } from 'vitest'

import * as childConsole from '../console'
import checkVersion from './version'
import { VERSION } from '../../common/consts'

describe('child/check/version', () => {
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
