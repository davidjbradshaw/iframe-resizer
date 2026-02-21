import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import settings from '../values/settings'
import run from './settings'

describe('child/check/settings', () => {
  beforeEach(() => {
    settings.targetOrigin = '*'
    settings.autoResize = true
    vi.spyOn(childConsole, 'info').mockImplementation(() => {})
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs targetOrigin and does not log auto-resize when enabled', () => {
    run()

    expect(childConsole.info).toHaveBeenCalledTimes(1)
    expect(childConsole.info).toHaveBeenCalledWith(
      expect.stringContaining('Set targetOrigin for parent:'),
      expect.anything(),
    )

    expect(childConsole.log).not.toHaveBeenCalledWith(
      expect.stringContaining('Auto Resize disabled'),
    )
  })

  it('logs auto-resize disabled when settings.autoResize is false', () => {
    settings.autoResize = false
    run()

    expect(childConsole.log).toHaveBeenCalledWith('Auto Resize disabled')
  })
})
