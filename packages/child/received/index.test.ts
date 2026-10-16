import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({
  errorBoundary: (fn) => fn,
  event: vi.fn(),
  warn: vi.fn(),
}))
vi.mock('./is', () => ({
  isFromOwnIframe: vi.fn(() => false),
  isMessageForUs: vi.fn(() => true),
}))
vi.mock('./utils', () => ({ getMessageType: vi.fn(() => 'unknown') }))
vi.mock('./process-request', () => ({ default: { known: vi.fn() } }))
vi.mock('./source', () => ({ default: vi.fn(() => true) }))

const { default: receiver } = await import('./index')
const { warn } = await import('../console')
const { isFromOwnIframe } = await import('./is')
const { getMessageType } = await import('./utils')
const processRequest = (await import('./process-request')).default
const isMessageFromParent = (await import('./source')).default

describe('child/received/index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('dispatches to processRequest when message type is known', () => {
    getMessageType.mockReturnValue('known')
    const evt = { data: '[iFrameSizer]x' }
    receiver(evt)

    expect(processRequest.known).toHaveBeenCalledWith(evt)
  })

  test('checks which window a message is from before acting on it', () => {
    isMessageFromParent.mockReturnValueOnce(false)
    getMessageType.mockReturnValue('known')
    const evt = { data: '[iFrameSizer]known', source: {} }
    receiver(evt)

    expect(isMessageFromParent).toHaveBeenCalledWith(evt, 'known')
    expect(processRequest.known).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  test('does not warn about an unknown message the source check rejects', () => {
    isMessageFromParent.mockReturnValueOnce(false)
    getMessageType.mockReturnValue('mystery')
    receiver({ data: '[iFrameSizer]mystery', source: {} })

    expect(warn).not.toHaveBeenCalled()
  })

  test('warns about a message type from the parent it does not know', () => {
    getMessageType.mockReturnValue('surprise')
    receiver({ data: 'x' })
    expect(warn).toHaveBeenCalled()
  })

  test('ignores messages from its own iframes, without warning', () => {
    isFromOwnIframe.mockReturnValueOnce(true)
    getMessageType.mockReturnValue('known')
    receiver({ data: '[iFrameSizer]inner:100:200:mutationObserver' })

    expect(processRequest.known).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })
})
