import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({
  advise: vi.fn(),
  event: vi.fn(),
}))

const { getOrigin, allowsScriptsAndOrigin } = await import('./timeout')

describe('getOrigin', () => {
  test('parses origin from a valid URL', () => {
    expect(getOrigin('https://example.com/path')).toBe('https://example.com')
  })

  test('parses origin with port', () => {
    expect(getOrigin('https://example.com:8443/a/b')).toBe(
      'https://example.com:8443',
    )
  })

  test('returns null for an invalid URL', () => {
    expect(getOrigin('not-a-url')).toBeNull()
  })

  test('returns null for an empty string', () => {
    expect(getOrigin('')).toBeNull()
  })
})

describe('allowsScriptsAndOrigin', () => {
  test('returns true when sandbox has allow-scripts but not allow-same-origin', () => {
    const sandbox = {
      length: 1,
      contains: (token: string) => token === 'allow-scripts',
    }

    expect(allowsScriptsAndOrigin(sandbox)).toBe(true)
  })

  test('returns false when sandbox has both allow-scripts and allow-same-origin', () => {
    const sandbox = {
      length: 2,
      contains: () => true,
    }

    expect(allowsScriptsAndOrigin(sandbox)).toBe(false)
  })

  test('throws for null because typeof null is object', () => {
    expect(() => allowsScriptsAndOrigin(null)).toThrow()
  })

  test('returns false for an empty string', () => {
    expect(allowsScriptsAndOrigin('')).toBe(false)
  })

  test('returns false when sandbox has length 0', () => {
    const sandbox = {
      length: 0,
      contains: () => false,
    }

    expect(allowsScriptsAndOrigin(sandbox)).toBe(false)
  })
})
