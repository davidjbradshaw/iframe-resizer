import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: {
    a: { autoResize: true, firstRun: false, iframe: { id: 'a' } },
    b: { autoResize: false, firstRun: false, iframe: { id: 'b' } },
    c: { autoResize: true, firstRun: true, iframe: { id: 'c' } },
  },
}))

const trigger = (await import('../send/trigger')).default
const tabVisible = (await import('./visible')).default

describe('core/events/visible', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true,
    })
    vi.clearAllMocks()
  })

  test('triggers resize for autoResize and not firstRun frames', () => {
    tabVisible()

    expect(trigger).toHaveBeenCalledTimes(1)
    expect(trigger).toHaveBeenCalledWith('tabVisible', 'resize', 'a')
  })

  test('skips when document is hidden', () => {
    Object.defineProperty(document, 'hidden', { value: true })
    tabVisible()

    expect(trigger).not.toHaveBeenCalled()
  })
})
