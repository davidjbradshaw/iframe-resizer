import { describe, expect, it } from 'vitest'

import observers from './observers'

describe('child/observed/observers', () => {
  it('exports an empty object', () => {
    expect(typeof observers).toBe('object')
    expect(Object.keys(observers)).toHaveLength(0)
  })
})
