import { describe, expect, it } from 'vitest'

import getMode, { getKey, getModeData, getModeLabel } from './mode'

describe('common/mode', () => {
  it('returns -1 when no mode key is present', () => {
    expect(getMode({})).toBe(-1)
  })

  it('getKey/getModeData/getModeLabel return strings', () => {
    expect(typeof getKey(0)).toBe('string')
    expect(typeof getModeData(0)).toBe('string')
    expect(typeof getModeLabel(0)).toBe('string')
  })
})
