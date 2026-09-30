import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../values/settings', () => ({
  default: {} as Record<string, any>,
}))

const settings = (await import('../values/settings')).default
const changesIframeWidth = (await import('./changes-iframe-width')).default

describe('core/received/changes-iframe-width', () => {
  beforeEach(() => {
    for (const key of Object.keys(settings)) delete settings[key]
  })

  test('is true when the width of the iframe is set', () => {
    settings.wide = { sizeWidth: true }

    expect(changesIframeWidth('[iFrameSizer]wide:100:200:resizeObserver')).toBe(
      true,
    )
  })

  test('is false when only the height of the iframe is set', () => {
    settings.tall = { sizeWidth: false }

    expect(changesIframeWidth('[iFrameSizer]tall:100:200:resizeObserver')).toBe(
      false,
    )
  })

  test('reads the id from the first field only', () => {
    settings.wide = { sizeWidth: true }
    settings.tall = { sizeWidth: false }

    // A later field that happens to match another iframe id is not the id
    expect(changesIframeWidth('[iFrameSizer]tall:100:200:message:wide')).toBe(
      false,
    )
  })

  test('is false for an iframe it has no settings for', () => {
    expect(changesIframeWidth('[iFrameSizer]unknown:100:200:init')).toBe(false)
  })

  test('is false for a message that is not a string', () => {
    settings.undefined = { sizeWidth: true }

    expect(changesIframeWidth()).toBe(false)
    expect(changesIframeWidth({ id: 'wide' })).toBe(false)
  })
})
