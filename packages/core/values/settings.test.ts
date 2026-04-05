import { describe, expect, it } from 'vitest'

import settings from './settings'

describe('core/values/settings', () => {
  it('exports an empty settings object', () => {
    expect(typeof settings).toBe('object')
    expect(Object.keys(settings)).toHaveLength(0)
  })
})
