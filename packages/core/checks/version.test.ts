import { VERSION } from '@iframe-resizer/common/consts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as coreConsole from '../console'
import settings from '../values/settings'
import checkVersion from './version'

describe('core/checks/version', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('records the child version on the iframe settings', () => {
    vi.spyOn(coreConsole, 'log').mockImplementation(() => {})
    settings.withSettings = {}

    checkVersion('withSettings', '1.2.3')

    expect(settings.withSettings.childVersion).toBe('1.2.3')
    delete settings.withSettings
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
