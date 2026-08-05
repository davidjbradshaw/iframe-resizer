import { beforeEach, describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'
import meetsMinChildVersion from './min-child-version'

describe('core/checks/min-child-version', () => {
  beforeEach(() => {
    vi.resetModules()
    for (const key of Object.keys(settings)) delete settings[key]
  })

  it('returns false when settings missing for id', () => {
    expect(meetsMinChildVersion('missing')).toBe(false)
  })

  it('returns false when childVersion is undefined (legacy)', () => {
    settings.id1 = { childVersion: undefined }
    expect(meetsMinChildVersion('id1')).toBe(false)
  })

  it('returns false when childVersion major is less than 6', () => {
    settings.id1 = { childVersion: '5.4.0' }
    expect(meetsMinChildVersion('id1')).toBe(false)
  })

  it('returns true when childVersion major is exactly 6', () => {
    settings.id1 = { childVersion: '6.0.0' }
    expect(meetsMinChildVersion('id1')).toBe(true)
  })

  it('returns true when childVersion is a 6.x prerelease', () => {
    settings.id1 = { childVersion: '6.1.0-beta.1' }
    expect(meetsMinChildVersion('id1')).toBe(true)
  })

  it('returns true when childVersion major is greater than 6', () => {
    settings.id1 = { childVersion: '7.0.0' }
    expect(meetsMinChildVersion('id1')).toBe(true)
  })

  it('returns false for non-string version', () => {
    settings.id1 = { childVersion: 6 as any }
    expect(meetsMinChildVersion('id1')).toBe(false)
  })
})
