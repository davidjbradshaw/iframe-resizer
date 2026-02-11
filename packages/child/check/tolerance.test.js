import { describe, expect, it } from 'vitest'

import settings from '../values/settings'
import tolerance from './tolerance'

describe('child/check/tolerance', () => {
  it('returns true when difference exceeds tolerance', () => {
    settings.tolerance = 1

    expect(tolerance(10, 8)).toBe(true)
  })

  it('returns false when difference within tolerance', () => {
    settings.tolerance = 5

    expect(tolerance(10, 8)).toBe(false)
    expect(tolerance(10, 12)).toBe(false)
  })
})
