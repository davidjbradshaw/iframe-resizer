import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../values/settings', () => ({
  default: {} as Record<string, any>,
}))

const settings = (await import('../values/settings')).default
const isWidthLegacy = (await import('./is-width-legacy')).default

describe('core/received/is-width-legacy', () => {
  beforeEach(() => {
    for (const key of Object.keys(settings)) delete settings[key]
  })

  test('is true for an iframe using a legacy width direction', () => {
    settings.old = { sizeWidth: true, widthLegacy: true }

    expect(isWidthLegacy('[iFrameSizer]old:100:200:resizeObserver')).toBe(true)
  })

  test('is false for an iframe whose width is sized to its content', () => {
    settings.wide = { sizeWidth: true, widthLegacy: false }

    expect(isWidthLegacy('[iFrameSizer]wide:100:200:resizeObserver')).toBe(
      false,
    )
  })

  test('reads the id from the first field only', () => {
    settings.old = { widthLegacy: true }
    settings.tall = { widthLegacy: false }

    // A later field that happens to match another iframe id is not the id
    expect(isWidthLegacy('[iFrameSizer]tall:100:200:message:old')).toBe(false)
  })

  test('is false for an iframe it has no settings for', () => {
    expect(isWidthLegacy('[iFrameSizer]unknown:100:200:init')).toBe(false)
  })

  test('is false for a message that is not a string', () => {
    settings.undefined = { widthLegacy: true }

    expect(isWidthLegacy()).toBe(false)
    expect(isWidthLegacy({ id: 'old' })).toBe(false)
  })
})
