import { describe, expect, it } from 'vitest'

import checkBoth from './both'

describe('child/check/both', () => {
  it('returns true when calculateWidth equals calculateHeight', () => {
    expect(checkBoth({ calculateWidth: true, calculateHeight: true })).toBe(
      true,
    )

    expect(checkBoth({ calculateWidth: false, calculateHeight: false })).toBe(
      true,
    )
  })

  it('returns false when calculateWidth differs from calculateHeight', () => {
    expect(checkBoth({ calculateWidth: true, calculateHeight: false })).toBe(
      false,
    )

    expect(checkBoth({ calculateWidth: false, calculateHeight: true })).toBe(
      false,
    )
  })
})
