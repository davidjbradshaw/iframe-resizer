import { describe, expect, test, vi } from 'vitest'

vi.mock('../../common/utils', () => ({ typeAssert: vi.fn() }))
vi.mock('../send/message', () => ({ default: vi.fn() }))

const { typeAssert } = await import('../../common/utils')
const sendMessage = (await import('../send/message')).default
const { MESSAGE } = await import('../../common/consts')
const send = (await import('./send-message')).default

describe('child/methods/send-message', () => {
  test('sends JSON stringified message to parent with optional targetOrigin', () => {
    send({ a: 1 }, 'https://example.com')

    expect(typeAssert).toHaveBeenCalled()
    expect(sendMessage).toHaveBeenCalledWith(
      0,
      0,
      MESSAGE,
      '{"a":1}',
      'https://example.com',
    )
  })

  test('omits targetOrigin when not provided', () => {
    send('x')

    expect(sendMessage).toHaveBeenCalledWith(0, 0, MESSAGE, '"x"', undefined)
  })
})
