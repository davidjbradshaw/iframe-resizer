import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { calculateWidth: false, maxContentWidth: false },
}))

const { log } = await import('../console')
const settings = (await import('../values/settings')).default
const setContentWidth = (await import('./content-width')).default

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

  test('follows the parent changing its mind', () => {
    update(true, false)
    expect(widths()).toEqual(UNTOUCHED)

    update(true, true)
    expect(widths()).toEqual(MAX_CONTENT)

    update(true, false)
    expect(widths()).toEqual(UNTOUCHED)
  })
})
