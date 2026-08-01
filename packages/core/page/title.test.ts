import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: {
    a: { iframe: { title: '' }, syncTitle: true },
    b: { iframe: {}, syncTitle: false },
    c: { iframe: { title: 'Existing Title' }, syncTitle: true },
  },
}))

const { checkTitle, setTitle } = await import('./title')
const { info } = await import('../console')
const settings = (await import('../values/settings')).default

describe('core/page/title', () => {
  test('checkTitle returns true when title empty or undefined', () => {
    expect(checkTitle('a')).toBe(true)
    expect(checkTitle('b')).toBe(true)
  })

  test('setTitle updates title and logs when syncTitle enabled', () => {
    setTitle('a', 'Hello')

    expect(settings.a.iframe.title).toBe('Hello')
    expect(info).toHaveBeenCalled()
  })

  test('checkTitle returns false when title has content', () => {
    expect(checkTitle('c')).toBe(false)
  })

  test('setTitle does nothing when syncTitle is disabled', () => {
    vi.clearAllMocks()
    setTitle('b', 'Should Not Set')

    expect(settings.b.iframe.title).toBeUndefined()
    expect(info).not.toHaveBeenCalled()
  })
})
