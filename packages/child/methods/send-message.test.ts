import { describe, expect, test, vi } from 'vitest'

vi.mock('@iframe-resizer/common', () => ({ typeAssert: vi.fn() }))
vi.mock('../send/message', () => ({ default: vi.fn() }))

const { typeAssert } = await import('@iframe-resizer/common')
const sendMessage = (await import('../send/message')).default
const { MESSAGE } = await import('@iframe-resizer/common/consts')
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

  test.each([
    ['undefined', undefined],
    ['a function', () => {}],
    ['a symbol', Symbol('x')],
  ])(
    'throws, and sends nothing, for %s, which JSON cannot encode',
    (_, msg) => {
      vi.mocked(sendMessage).mockClear()

      expect(() => send(msg)).toThrow(TypeError)
      expect(sendMessage).not.toHaveBeenCalled()
    },
  )
})
