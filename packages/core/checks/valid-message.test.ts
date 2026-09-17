import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn(), warn: vi.fn() }))

const { log, warn } = await import('../console')
const checkValidMessage = (await import('./valid-message')).default

function createMessageData(overrides = {}) {
  return {
    height: 100,
    width: 200,
    id: 'test',
    type: 'resize',
    iframe: document.createElement('iframe'),
    ...overrides,
  }
}

describe('core/checks/valid-message', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    })
  })

  it('returns true for valid message', () => {
    expect(checkValidMessage(createMessageData())).toBe(true)
  })

  it('returns false and warns when both width and height are 0', () => {
    expect(checkValidMessage(createMessageData({ width: 0, height: 0 }))).toBe(
      false,
    )
    expect(warn).toHaveBeenCalledWith(
      'test',
      expect.stringContaining('Unsupported message'),
    )
  })

  it('returns false and logs when height is 0', () => {
    expect(checkValidMessage(createMessageData({ height: 0 }))).toBe(false)
    expect(log).toHaveBeenCalledWith('test', 'Ignoring message with 0 height')
  })

  it('returns false and logs when width is 0', () => {
    expect(checkValidMessage(createMessageData({ width: 0 }))).toBe(false)
    expect(log).toHaveBeenCalledWith('test', 'Ignoring message with 0 width')
  })

  it('returns false when page is hidden', () => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    })
    expect(checkValidMessage(createMessageData())).toBe(false)
    expect(log).toHaveBeenCalledWith(
      'test',
      'Page hidden - ignored resize request',
    )
  })
})
