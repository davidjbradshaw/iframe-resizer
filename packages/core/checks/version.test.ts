import { beforeEach, describe, expect, it, vi } from 'vitest'

import { VERSION } from '../../common/consts'
import * as coreConsole from '../console'
import checkVersion from './version'

describe('core/checks/version', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns early when versions match', () => {
    vi.spyOn(coreConsole, 'advise').mockImplementation(() => {})
    vi.spyOn(coreConsole, 'log').mockImplementation(() => {})
    checkVersion('id', VERSION)

    expect(coreConsole.advise).not.toHaveBeenCalled()
    expect(coreConsole.log).not.toHaveBeenCalled()
  })

  it('advises legacy when undefined version', () => {
    vi.spyOn(coreConsole, 'advise').mockImplementation(() => {})
    checkVersion('id')

    expect(coreConsole.advise).toHaveBeenCalledWith(
      'id',
      expect.stringContaining(''),
    )
  })

  it('logs mismatch when versions differ', () => {
    vi.spyOn(coreConsole, 'log').mockImplementation(() => {})
    checkVersion('id', '0.0.0')

    expect(coreConsole.log).toHaveBeenCalledTimes(1)
  })
})
