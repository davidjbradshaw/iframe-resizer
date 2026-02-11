import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as commonMode from '../../common/mode'
import * as utils from '../../common/utils'
import * as childConsole from '../console'
import settings from '../values/settings'
import state from '../values/state'
import checkMode from './mode'

describe('child/check/mode', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    settings.mode = 0
    state.firstRun = true

    vi.spyOn(commonMode, 'default').mockImplementation(({ key }) =>
      // simple deterministic mapping: key => 1, key2 => 0
      key ? 1 : 0,
    )
    vi.spyOn(commonMode, 'getModeData').mockImplementation((i) => `data${i}`)
    vi.spyOn(commonMode, 'getModeLabel').mockImplementation(() => 'label')
    vi.spyOn(utils, 'isDef').mockImplementation((v) => v !== undefined)

    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    vi.spyOn(childConsole, 'purge').mockImplementation(() => {})
    vi.spyOn(childConsole, 'vInfo').mockImplementation(() => {})

    // mock sessionStorage
    const store = new Map()
    vi.stubGlobal('sessionStorage', {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
    })
  })

  it('advises and throws sanitized message when mode < 0 and version is defined', () => {
    // Force mode < 0 branch by making setMode return -1
    commonMode.default.mockReturnValueOnce(-1).mockReturnValueOnce(-1)

    expect(() =>
      checkMode({ key: 'a', key2: 'b', mode: -2, version: '1.0.0' }),
    ).toThrow()

    expect(childConsole.purge).toHaveBeenCalled()
    expect(childConsole.advise).toHaveBeenCalled()
  })

  it('logs vInfo and sets session value when version is undefined', () => {
    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })

    expect(childConsole.vInfo).toHaveBeenCalled()
    expect(sessionStorage.getItem('ifr')).toBeDefined()
  })
})
