import { beforeEach, describe, expect, it } from 'vitest'

import settings from '../values/settings'
import tolerance from './tolerance'

describe('child/check/tolerance', () => {
  beforeEach(() => {
    settings.tolerance = 0
  })

  it('returns true when difference exceeds tolerance', () => {
    settings.tolerance = 1

    expect(tolerance(10, 8)).toBe(true)
  })

  it('returns false when difference within tolerance', () => {
    settings.tolerance = 5

    expect(tolerance(10, 8)).toBe(false)
    expect(tolerance(10, 12)).toBe(false)
  })

  it('returns false when difference equals tolerance exactly', () => {
    settings.tolerance = 2

    expect(tolerance(10, 8)).toBe(false)
    expect(tolerance(8, 10)).toBe(false)
  })

  it('returns true when values are identical and tolerance is 0', () => {
    settings.tolerance = 0

    expect(tolerance(10, 10)).toBe(false)
  })
})
