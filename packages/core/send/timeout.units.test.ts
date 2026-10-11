import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({
  advise: vi.fn(),
  event: vi.fn(),
}))

const { allowsScriptsAndOrigin } = await import('./timeout')

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
