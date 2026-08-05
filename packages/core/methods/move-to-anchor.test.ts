import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: {} }))

const { default: moveToAnchor } = await import('./move-to-anchor')
const { default: trigger } = await import('../send/trigger')
const settings = (await import('../values/settings')).default

describe('core/methods/move-to-anchor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const k of Object.keys(settings)) delete settings[k]
  })

  test('triggers postMessage when inPageLinks is enabled', () => {
    settings.if1 = { inPageLinks: true }

    moveToAnchor('if1', 'section-1')

    expect(trigger).toHaveBeenCalledWith(
      'Move to anchor',
      'moveToAnchor:section-1',
      'if1',
    )
  })

  test('throws when inPageLinks is not enabled', () => {
    settings.if1 = { inPageLinks: false }

    expect(() => moveToAnchor('if1', 'section-1')).toThrow(/inPageLinks.*true/)
    expect(trigger).not.toHaveBeenCalled()
  })

  test('throws when settings entry is missing', () => {
    expect(() => moveToAnchor('missing', 'section-1')).toThrow(
      /inPageLinks.*true/,
    )
    expect(trigger).not.toHaveBeenCalled()
  })

  test('throws TypeError when anchor is not a string', () => {
    settings.if1 = { inPageLinks: true }

    // @ts-expect-error testing runtime type check
    expect(() => moveToAnchor('if1', 123)).toThrow(TypeError)
    expect(trigger).not.toHaveBeenCalled()
  })
})
