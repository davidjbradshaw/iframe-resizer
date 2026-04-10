import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({
  errorBoundary: (fn) => fn,
  event: vi.fn(),
  warn: vi.fn(),
}))
vi.mock('./is', () => ({
  isMessageForUs: vi.fn(() => true),
  isMiddleTier: vi.fn(() => false),
}))
vi.mock('./utils', () => ({ getMessageType: vi.fn(() => 'unknown') }))
vi.mock('./process-request', () => ({ default: { known: vi.fn() } }))

const { default: receiver } = await import('./index')
const { warn } = await import('../console')
const { isMiddleTier } = await import('./is')
const { getMessageType } = await import('./utils')
const processRequest = (await import('./process-request')).default
const state = (await import('../values/state')).default

describe('child/received/index', () => {
  beforeEach(() => {
    state.firstRun = true
    vi.clearAllMocks()
  })

  test('dispatches to processRequest when message type is known', () => {
    getMessageType.mockReturnValue('known')
    const evt = { data: '[iFrameSizer]x' }
    receiver(evt)

    expect(processRequest.known).toHaveBeenCalledWith(evt)
  })

  test('warns when firstRun and isMiddleTier on unknown type', () => {
    getMessageType.mockReturnValue('mystery')
    isMiddleTier.mockReturnValue(true)
    receiver({ data: 'whatever' })

    expect(warn).toHaveBeenCalled()
  })

  test('warns unexpected message when not firstRun', () => {
    state.firstRun = false
    getMessageType.mockReturnValue('surprise')
    receiver({ data: 'x' })
    expect(warn).toHaveBeenCalled()
  })
})
