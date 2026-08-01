/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../console', () => ({
  warn: vi.fn(),
}))

// Import after mock
import settings from './settings'
import * as childConsole from '../console'

describe('child/values/settings', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('has expected default flags', () => {
    expect(settings.autoResize).toBe(true)
    expect(settings.calculateHeight).toBe(true)
    expect(settings.calculateWidth).toBe(false)
    expect(settings.targetOrigin).toBe('*')
  })

  it('onMessage warns by default', () => {
    settings.onMessage()
    expect(childConsole.warn).toHaveBeenCalledWith(
      'onMessage function not defined',
    )
  })
})
