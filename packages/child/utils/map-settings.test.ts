import { describe, expect, test, vi } from 'vitest'

vi.mock('../values/settings', () => ({ default: {} }))

const map2settings = (await import('./map-settings')).default
const settings = (await import('../values/settings')).default

describe('child/utils/map-settings', () => {
  test('maps provided entries to settings skipping undefined', () => {
    map2settings({ a: 1, b: undefined, c: 3 })

    expect(settings).toEqual({ a: 1, c: 3 })
  })
})
