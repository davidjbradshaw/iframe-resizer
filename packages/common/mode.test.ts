import { describe, expect, it } from 'vitest'

import getMode, { getKey, getModeData, getModeLabel } from './mode'

describe('common/mode', () => {
  it('returns -1 when no mode value is present', () => {
    expect(getMode({})).toBe(-1)
  })

  it('getKey/getModeData/getModeLabel return strings', () => {
    expect(typeof getKey(0)).toBe('string')
    expect(typeof getModeData(0)).toBe('string')
    expect(typeof getModeLabel(0)).toBe('string')
  })

  it('returns -1 for empty auth code', () => {
    const options = { license: '' }
    expect(getMode(options)).toBe(-1)
  })

  it('returns -2 for invalid credential format', () => {
    const options = { license: 'invalid-code-format' }
    expect(getMode(options)).toBe(-2)
  })

  it('returns -2 for tampered auth value', () => {
    const options = { license: 'fake-abc-def' }
    expect(getMode(options)).toBe(-2)
  })

  it('handles auth code with multiple parts', () => {
    const options = { license: 'part1-part2-part3' }
    const result = getMode(options)
    expect(typeof result).toBe('number')
  })

  it('processes auth code through all validation steps', () => {
    // Test with a properly formatted (but likely invalid) code
    const options = { license: 'test-code-hash' }
    const result = getMode(options)
    expect(result).toBeDefined()
    expect(typeof result).toBe('number')
  })

  it('getModeData returns different strings for different indices', () => {
    const data0 = getModeData(0)
    const data1 = getModeData(1)
    const data2 = getModeData(2)

    expect(data0).not.toBe(data1)
    expect(data1).not.toBe(data2)
    expect(typeof data0).toBe('string')
  })

  it('getModeLabel returns different strings for different indices', () => {
    const label0 = getModeLabel(0)
    const label1 = getModeLabel(1)

    expect(label0).not.toBe(label1)
    expect(typeof label0).toBe('string')
  })

  it('getKey returns different strings for different indices', () => {
    const key0 = getKey(0)
    const key1 = getKey(1)
    const key2 = getKey(2)

    expect(key0).not.toBe(key1)
    expect(key1).not.toBe(key2)
    expect(typeof key0).toBe('string')
  })
})
