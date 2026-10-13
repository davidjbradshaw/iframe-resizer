import { describe, expect, it } from 'vitest'

import { getHeight, getWidth } from './index'

describe('child/size/index', () => {
  it('re-exports getHeight and getWidth with labels', () => {
    expect(getHeight.label).toBe('height')
    expect(getWidth.label).toBe('width')
  })
})
