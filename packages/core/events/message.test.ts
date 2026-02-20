import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('./wrapper', () => ({ default: vi.fn() }))

const { onMessage } = await import('./message')
const { log } = await import('../console')
const on = (await import('./wrapper')).default

describe('core/events/message', () => {
  test('parses message and calls wrapper', () => {
    const data = { id: 'abc', iframe: { id: 'abc' } }
    onMessage(data, JSON.stringify({ x: 1 }))

    expect(log).toHaveBeenCalled()
    expect(on).toHaveBeenCalledWith('abc', 'onMessage', {
      iframe: data.iframe,
      message: { x: 1 },
    })
  })
})
