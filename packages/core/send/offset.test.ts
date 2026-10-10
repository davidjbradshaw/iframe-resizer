import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn(), warn: vi.fn() }))
vi.mock('../values/settings', () => ({ default: {} }))

const setOffsetSize = (await import('./offset')).default
const { log, warn } = await import('../console')
const settings = (await import('../values/settings')).default

const VERTICAL = { sizeHeight: true, sizeWidth: false }
const HORIZONTAL = { sizeHeight: false, sizeWidth: true }
const BOTH = { sizeHeight: true, sizeWidth: true }

describe('core/send/offset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    settings.id = { offsetHeight: null, offsetWidth: null }
  })

  test('no-op when no offset is set', () => {
    Object.assign(settings.id, VERTICAL)
    setOffsetSize('id')

    expect(settings.id.offsetHeight).toBeNull()
    expect(log).not.toHaveBeenCalled()
  })

  test('sets offsetHeight for vertical', () => {
    Object.assign(settings.id, VERTICAL, { offsetSize: 10 })
    setOffsetSize('id')

    expect(settings.id.offsetHeight).toBe(10)
    expect(settings.id.offsetWidth).toBeNull()
    expect(log).toHaveBeenCalled()
  })

  test('sets offsetWidth for horizontal', () => {
    Object.assign(settings.id, HORIZONTAL, { offsetSize: 15 })
    setOffsetSize('id')

    expect(settings.id.offsetHeight).toBeNull()
    expect(settings.id.offsetWidth).toBe(15)
  })

  test('sets both offsets for direction both', () => {
    Object.assign(settings.id, BOTH, { offsetSize: 25 })
    setOffsetSize('id')

    expect(settings.id.offsetHeight).toBe(25)
    expect(settings.id.offsetWidth).toBe(25)
  })

  test('zero clears the offset', () => {
    Object.assign(settings.id, VERTICAL, { offsetSize: 0, offsetHeight: 40 })
    setOffsetSize('id')

    expect(settings.id.offsetHeight).toBe(0)
  })

  test('the stored offset follows a change of direction', () => {
    Object.assign(settings.id, VERTICAL, { offsetSize: 20 })
    setOffsetSize('id')
    Object.assign(settings.id, HORIZONTAL)
    setOffsetSize('id')

    expect(settings.id.offsetHeight).toBeNull()
    expect(settings.id.offsetWidth).toBe(20)
  })

  test.each([Number.NaN, false, '10'])(
    'warns and ignores an offset of %s',
    (offsetSize) => {
      Object.assign(settings.id, VERTICAL, { offsetSize, offsetHeight: 40 })
      setOffsetSize('id')

      expect(settings.id.offsetHeight).toBe(40)
      expect(warn).toHaveBeenCalled()
    },
  )
})
