import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as commonMode from '../../common/mode'
import * as utils from '../../common/utils'
import * as childConsole from '../console'
import settings from '../values/settings'
import state from '../values/state'
import checkMode, { showVersion } from './mode'

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
    vi.spyOn(childConsole, 'adviseNow').mockImplementation(() => {})
    vi.spyOn(childConsole, 'purge').mockImplementation(() => {})
    vi.spyOn(childConsole, 'vInfo').mockImplementation(() => {})
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
    commonMode.default.mockReturnValueOnce(0).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })

    expect(childConsole.vInfo).toHaveBeenCalled()
    expect(sessionStorage.getItem('ifr')).toBeDefined()
  })

  it('advises when oMode > -1 and mode > oMode', () => {
    // Set session to something other than VERSION
    sessionStorage.setItem('ifr', 'old-version')
    // Need mode >= 6 to hit default (showVersion), with oMode > -1 and mode > oMode
    commonMode.default.mockReturnValueOnce(6).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 2, version: undefined })

    expect(childConsole.vInfo).toHaveBeenCalled()
    expect(sessionStorage.getItem('ifr')).toBeDefined()
  })

  it('advises when mode === 0 and version not defined', () => {
    // mode=0 hits default case → showVersion, where mode === 0 triggers adviseNow(getModeData(3))
    commonMode.default.mockReturnValueOnce(0).mockReturnValueOnce(0)

    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })

    expect(childConsole.adviseNow).toHaveBeenCalled()
    expect(childConsole.vInfo).toHaveBeenCalled()
  })

  it('skips else-if block when version is defined but mode did not increase (oMode <= -1)', () => {
    // pMode=1, cMode=0 → mode=1; oMode=-1; version is defined → else-if is false
    // The else-if condition is: !isDef(version) || (oMode > -1 && mode > oMode)
    // With isDef(version)=true and oMode=-1 → both sides false → branch not taken
    checkMode({ key: 'a', key2: 'b', mode: -1, version: '1.0.0' })

    expect(childConsole.vInfo).not.toHaveBeenCalled()
    expect(childConsole.advise).not.toHaveBeenCalled()
  })

  it('does not advise for mode >= 2 (skips advise(getModeData(3)) line)', () => {
    // mode >= 6 hits default case → showVersion, where mode >= 2 skips advise(getModeData(3))
    commonMode.default.mockReturnValueOnce(6).mockReturnValueOnce(0)

    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })

    expect(childConsole.vInfo).toHaveBeenCalled()
    // advise for mode < 2 should NOT have been called
    expect(childConsole.advise).not.toHaveBeenCalled()
  })

  it('calls advise with getModeData(6) for modes 1-3 when version is not defined', () => {
    commonMode.default.mockReturnValueOnce(3).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })
    expect(childConsole.advise).toHaveBeenCalledWith('data6')
  })

  it('calls advise with getModeData(7) for mode 4 when version is not defined', () => {
    commonMode.default.mockReturnValueOnce(4).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })
    expect(childConsole.advise).toHaveBeenCalledWith('data7')
  })

  it('calls advise with getModeData(8) for mode 5 when version is not defined', () => {
    commonMode.default.mockReturnValueOnce(5).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })
    expect(childConsole.advise).toHaveBeenCalledWith('data8')
  })

  it('does not advise for modes 1-5 when version is defined', () => {
    commonMode.default.mockReturnValueOnce(3).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 0, version: '1.0.0' })
    expect(childConsole.advise).not.toHaveBeenCalled()
  })

  it('sets settings.mode for modes 1-5', () => {
    commonMode.default.mockReturnValueOnce(4).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })
    expect(settings.mode).toBe(4)
  })

  it('does not throw for modes 1-5 when not first run', () => {
    state.firstRun = false
    commonMode.default.mockReturnValueOnce(3).mockReturnValueOnce(0)
    expect(() =>
      checkMode({ key: 'a', key2: 'b', mode: 0, version: '1.0.0' }),
    ).not.toThrow()
    expect(childConsole.advise).toHaveBeenCalled()
  })

  it('throws when mode < 0 and version is undefined', () => {
    commonMode.default.mockReturnValueOnce(-1).mockReturnValueOnce(-1)
    expect(() =>
      checkMode({ key: 'a', key2: 'b', mode: -2, version: undefined }),
    ).toThrow()
  })

  it('sets settings.mode for mode 0', () => {
    commonMode.default.mockReturnValueOnce(0).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })
    expect(settings.mode).toBe(0)
  })

  it('sets settings.mode for modes >= 6', () => {
    commonMode.default.mockReturnValueOnce(8).mockReturnValueOnce(0)
    checkMode({ key: 'a', key2: 'b', mode: 0, version: undefined })
    expect(settings.mode).toBe(8)
  })

  it('does not set settings.mode when mode < 0', () => {
    commonMode.default.mockReturnValueOnce(-1).mockReturnValueOnce(-1)
    try {
      checkMode({ key: 'a', key2: 'b', mode: -2, version: undefined })
    } catch {
      /* expected */
    }
    expect(settings.mode).toBe(0)
  })

  it('defaults pMode to -1 when key is undefined', () => {
    commonMode.default.mockReturnValueOnce(0)
    checkMode({ key2: 'b', mode: 0, version: undefined })
    // pMode=-1, cMode=0 → mode=0
    expect(settings.mode).toBe(0)
  })

  it('defaults cMode to -1 when key2 is undefined', () => {
    commonMode.default.mockReturnValueOnce(0)
    checkMode({ key: 'a', mode: 0, version: undefined })
    // pMode=0, cMode=-1 → mode=0
    expect(settings.mode).toBe(0)
  })

  describe('showVersion', () => {
    it('calls vInfo when version is undefined', () => {
      showVersion(6, 0)
      expect(childConsole.vInfo).toHaveBeenCalled()
    })

    it('calls vInfo when version is defined but mode increased', () => {
      showVersion(6, 2, '1.0.0')
      expect(childConsole.vInfo).toHaveBeenCalled()
    })

    it('skips when version is defined and mode did not increase', () => {
      showVersion(6, 6, '1.0.0')
      expect(childConsole.vInfo).not.toHaveBeenCalled()
    })

    it('skips when version is defined and oMode <= -1', () => {
      showVersion(6, -1, '1.0.0')
      expect(childConsole.vInfo).not.toHaveBeenCalled()
    })

    it('calls adviseNow(getModeData(3)) when mode === 0', () => {
      showVersion(0, 0)
      expect(childConsole.adviseNow).toHaveBeenCalledWith('data3')
    })

    it('does not call adviseNow when mode !== 0', () => {
      showVersion(1, 0)
      expect(childConsole.adviseNow).not.toHaveBeenCalled()
    })
  })
})
