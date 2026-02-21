import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: {
    abc: { sizeHeight: true, sizeWidth: true, iframe: { style: {} } },
  },
}))

const setSize = (await import('./size')).default
const { info } = await import('../console')
const settings = (await import('../values/settings')).default

describe('core/events/size', () => {
  test('sets iframe style height and width and logs', () => {
    const data = { id: 'abc', height: 120, width: 340 }
    setSize(data)

    expect(settings.abc.iframe.style.height).toBe('120px')
    expect(settings.abc.iframe.style.width).toBe('340px')
    expect(info).toHaveBeenCalled()
  })

  test('does not set dimensions when sizeHeight/sizeWidth are false', async () => {
    const settings = (await import('../values/settings')).default
    settings.xyz = {
      sizeHeight: false,
      sizeWidth: false,
      iframe: { style: {} },
    }

    const data = { id: 'xyz', height: 200, width: 400 }
    setSize(data)

    expect(settings.xyz.iframe.style.height).toBeUndefined()
    expect(settings.xyz.iframe.style.width).toBeUndefined()
  })
})
