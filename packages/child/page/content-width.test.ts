import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { calculateWidth: false, widthLegacy: false },
}))

const { advise, log } = await import('../console')
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

const direction = (calculateWidth, widthLegacy = false) => {
  settings.calculateWidth = calculateWidth
  settings.widthLegacy = widthLegacy
  setContentWidth()
}

describe('child/page/content-width', () => {
  beforeEach(() => {
    direction(false)
    document.body.style.removeProperty('width')
    vi.clearAllMocks()
  })

  test('leaves the page alone when the width is not sized', () => {
    direction(false)

    expect(widths()).toEqual(UNTOUCHED)
    expect(advise).not.toHaveBeenCalled()
  })

  test('makes html and body as wide as their content when the width is sized', () => {
    direction(true)

    expect(widths()).toEqual(MAX_CONTENT)
    expect(log).toHaveBeenCalledTimes(1)
    expect(advise).not.toHaveBeenCalled()
  })

  test('applies it once, however often it is called', () => {
    direction(true)
    direction(true)

    expect(log).toHaveBeenCalledTimes(1)
  })

  test('puts back the widths the page had when the width stops being sized', () => {
    document.body.style.setProperty('width', '600px')

    direction(true)
    expect(widths()).toEqual([
      ['max-content', 'important'],
      ['max-content', 'important'],
    ])

    direction(false)
    expect(widths()).toEqual([
      ['', ''],
      ['600px', ''],
    ])
  })

  test('with the legacy direction leaves the page alone and advises, once', () => {
    direction(true, true)
    direction(true, true)

    expect(widths()).toEqual(UNTOUCHED)
    expect(advise).toHaveBeenCalledTimes(1)
    expect(advise).toHaveBeenCalledWith(
      expect.stringContaining('horizontal-legacy'),
    )
  })

  test('switches between legacy and content sizing', () => {
    direction(true, true)
    expect(widths()).toEqual(UNTOUCHED)

    direction(true)
    expect(widths()).toEqual(MAX_CONTENT)

    direction(true, true)
    expect(widths()).toEqual(UNTOUCHED)
  })
})
