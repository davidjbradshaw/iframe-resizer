import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: {
    id1: {
      sizeHeight: true,
      sizeWidth: false,
      offsetHeight: 0,
      offsetWidth: 0,
    },
    id2: {
      sizeHeight: false,
      sizeWidth: true,
      offsetHeight: 0,
      offsetWidth: 0,
    },
    id3: { sizeHeight: true, sizeWidth: true, offsetHeight: 0, offsetWidth: 0 },
  },
}))

const setOffsetSize = (await import('./offset')).default
const { log } = await import('../console')
const settings = (await import('../values/settings')).default

describe('core/send/offset', () => {
  test('no-op when no offset provided', () => {
    setOffsetSize('id1', {})

    expect(log).not.toHaveBeenCalled()
  })

  test('zero clears the offset', () => {
    settings.id1.offsetHeight = 40
    setOffsetSize('id1', { offsetSize: 0 })

    expect(settings.id1.offsetHeight).toBe(0)
  })

  test('sets both offsets for direction both', () => {
    setOffsetSize('id3', { offsetSize: 25 })

    expect(settings.id3.offsetHeight).toBe(25)
    expect(settings.id3.offsetWidth).toBe(25)
  })

  test('sets offsetHeight for vertical', () => {
    setOffsetSize('id1', { offset: 10 })

    expect(settings.id1.offsetHeight).toBe(10)
    expect(log).toHaveBeenCalled()
  })

  test('sets offsetWidth for horizontal', () => {
    setOffsetSize('id2', { offset: 15 })

    expect(settings.id2.offsetWidth).toBe(15)
    expect(log).toHaveBeenCalled()
  })
})
