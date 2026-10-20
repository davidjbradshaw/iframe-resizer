import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { calculateWidth: false, maxContentWidth: false },
}))

const { log } = await import('../console')
const settings = (await import('../values/settings')).default
const setContentWidth = (await import('./content-width')).default
const { reapplyBodyWidth } = await import('./content-width')

const widths = () =>
  [document.documentElement, document.body].map((el) => [
    el.style.getPropertyValue('width'),
    el.style.getPropertyPriority('width'),
  ])

const UNTOUCHED = [
  ['', ''],
  ['', ''],
]
const MAX_CONTENT = [
  ['max-content', 'important'],
  ['max-content', 'important'],
]

const update = (calculateWidth, maxContentWidth) => {
  settings.calculateWidth = calculateWidth
  settings.maxContentWidth = maxContentWidth
  setContentWidth()
}

describe('child/page/content-width', () => {
  beforeEach(() => {
    update(false, false)
    document.body.style.removeProperty('width')
    vi.clearAllMocks()
  })

  test('leaves the page alone when the width is not sized', () => {
    update(false, true)

    expect(widths()).toEqual(UNTOUCHED)
  })

  test('leaves the page alone when the parent does not ask', () => {
    update(true, false)

    expect(widths()).toEqual(UNTOUCHED)
  })

  test('makes html and body as wide as their content when asked', () => {
    update(true, true)

    expect(widths()).toEqual(MAX_CONTENT)
    expect(log).toHaveBeenCalledTimes(1)
  })

  test('applies it once, however often it is called', () => {
    update(true, true)
    update(true, true)

    expect(log).toHaveBeenCalledTimes(1)
  })

  test('puts back the widths the page had when it stops', () => {
    document.body.style.setProperty('width', '600px')

    update(true, true)
    expect(widths()).toEqual(MAX_CONTENT)

    update(false, false)
    expect(widths()).toEqual([
      ['', ''],
      ['600px', ''],
    ])
  })

  describe('reapplyBodyWidth, for a replaced body', () => {
    test('overrides the new body, and restores its own width later', () => {
      update(true, true)
      expect(widths()).toEqual(MAX_CONTENT)

      // As a fresh body (Turbo Drive) arrives, carrying its own width
      document.body.style.setProperty('width', '480px')
      reapplyBodyWidth()

      expect(widths()).toEqual(MAX_CONTENT)

      // The restore puts back the new body's width, not the old body's
      update(false, false)
      expect(widths()).toEqual([
        ['', ''],
        ['480px', ''],
      ])
    })

    test('keeps nothing to restore from a body that carries the override', () => {
      update(true, true)

      // Turbo Drive caches a snapshot of the body this already styled, so the
      // body that comes back has the override on it
      document.body.style.setProperty('width', 'max-content', 'important')
      reapplyBodyWidth()
      expect(widths()).toEqual(MAX_CONTENT)

      // Which is not a width to put back, or the body stays content-sized
      update(false, false)
      expect(widths()).toEqual(UNTOUCHED)
    })

    test('restores no width when the new body had none', () => {
      document.body.style.setProperty('width', '600px')
      update(true, true)

      document.body.style.removeProperty('width')
      reapplyBodyWidth()
      expect(widths()).toEqual(MAX_CONTENT)

      update(false, false)
      expect(widths()).toEqual(UNTOUCHED)
    })

    test('does nothing when the width is not being overridden', () => {
      document.body.style.setProperty('width', '480px')

      reapplyBodyWidth()

      expect(widths()).toEqual([
        ['', ''],
        ['480px', ''],
      ])
      expect(log).not.toHaveBeenCalled()
    })
  })

  test('follows the parent changing its mind', () => {
    update(true, false)
    expect(widths()).toEqual(UNTOUCHED)

    update(true, true)
    expect(widths()).toEqual(MAX_CONTENT)

    update(true, false)
    expect(widths()).toEqual(UNTOUCHED)
  })
})
