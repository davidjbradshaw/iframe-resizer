import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { calculateWidth: false, widthLegacy: false },
}))

const { advise } = await import('../console')
const settings = (await import('../values/settings')).default
const setContentWidth = (await import('./content-width')).default

const widths = () =>
  [document.documentElement, document.body].map((el) => [
    el.style.getPropertyValue('width'),
    el.style.getPropertyPriority('width'),
  ])

describe('child/page/content-width', () => {
  beforeEach(() => {
    // Return to the unset state between tests
    settings.calculateWidth = false
    settings.widthLegacy = false
    setContentWidth()
    vi.clearAllMocks()
  })

  test('leaves the page alone when the width is not sized', () => {
    setContentWidth()

    expect(widths()).toEqual([
      ['', ''],
      ['', ''],
    ])
  })

  test('makes html and body as wide as their content when the width is sized', () => {
    settings.calculateWidth = true
    setContentWidth()

    expect(widths()).toEqual([
      ['max-content', 'important'],
      ['max-content', 'important'],
    ])
    expect(advise).not.toHaveBeenCalled()
  })

  test('removes it again when the width stops being sized', () => {
    settings.calculateWidth = true
    setContentWidth()
    settings.calculateWidth = false
    setContentWidth()

    expect(widths()).toEqual([
      ['', ''],
      ['', ''],
    ])
  })

  test('does not remove a width the page set itself', () => {
    document.body.style.width = '600px'
    setContentWidth()

    expect(document.body.style.width).toBe('600px')
    document.body.style.removeProperty('width')
  })

  test('with a legacy direction leaves the page alone and advises, once', () => {
    settings.calculateWidth = true
    settings.widthLegacy = true
    setContentWidth()
    setContentWidth()

    expect(widths()).toEqual([
      ['', ''],
      ['', ''],
    ])
    expect(advise).toHaveBeenCalledTimes(1)
    expect(advise).toHaveBeenCalledWith(
      expect.stringContaining('horizontal-legacy'),
    )
  })
})
