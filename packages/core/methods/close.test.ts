import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn(), warn: vi.fn() }))
vi.mock('../events/wrapper', () => ({ default: vi.fn(() => true) }))
vi.mock('./disconnect', () => ({ default: vi.fn() }))

const { log, warn } = await import('../console')
const on = (await import('../events/wrapper')).default
const disconnect = (await import('./disconnect')).default
const { default: closeIframe } = await import('./close')

describe('core/methods/close', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('cancels when onBeforeClose returns false', () => {
    on.mockReturnValueOnce(false)
    const iframe = { id: 'if1', remove: vi.fn(), parentNode: {} }
    closeIframe(iframe)

    expect(log).toHaveBeenCalledWith(
      'if1',
      expect.stringContaining('cancelled'),
    )

    expect(iframe.remove).not.toHaveBeenCalled()
    expect(disconnect).not.toHaveBeenCalled()
  })

  test('removes iframe and disconnects when allowed', () => {
    on.mockReturnValueOnce(true)
    const iframe = { id: 'if2', remove: vi.fn(), parentNode: {} }
    closeIframe(iframe)

    expect(iframe.remove).toHaveBeenCalled()
    expect(disconnect).toHaveBeenCalledWith(iframe)
  })

  test('warns on remove error', () => {
    on.mockReturnValueOnce(true)
    const err = new Error('boom')
    const iframe = {
      id: 'if3',
      remove: vi.fn(() => {
        throw err
      }),
      parentNode: {},
    }
    closeIframe(iframe)

    expect(warn).toHaveBeenCalledWith('if3', err)
  })

  test('does not call remove when parentNode is missing', () => {
    on.mockReturnValueOnce(true)
    const iframe = { id: 'if4', remove: vi.fn(), parentNode: null }
    closeIframe(iframe)

    expect(iframe.remove).not.toHaveBeenCalled()
    expect(disconnect).toHaveBeenCalledWith(iframe)
  })
})
