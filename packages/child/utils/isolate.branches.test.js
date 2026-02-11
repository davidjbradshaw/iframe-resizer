import { describe, expect, test } from 'vitest'

import settings from '../values/settings'
import isolate from './isolate'

describe('child/utils/isolate branches', () => {
  test('throws when mode is negative', () => {
    settings.mode = -1
    const boom = () => {
      throw new Error('boom')
    }

    expect(() => isolate([boom])).toThrow('boom')
  })

  test('advises and logs error when mode is non-negative', () => {
    settings.mode = 0
    const boom = () => {
      throw new Error('kaboom')
    }
    const ok = () => {}

    expect(() => isolate([ok, boom])).not.toThrow()
  })
})
