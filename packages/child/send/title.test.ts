import { describe, expect, test, vi } from 'vitest'

vi.mock('./message', () => ({ default: vi.fn() }))

const sendMessage = (await import('./message')).default
const { TITLE } = await import('../../common/consts')
const sendTitle = (await import('./title')).default

describe('child/send/title', () => {
  test('sends TITLE when document has a title', () => {
    const d = globalThis.document
    const prev = d.title
    d.title = 'Hello'
    sendTitle()

    expect(sendMessage).toHaveBeenCalledWith(0, 0, TITLE, 'Hello')
    d.title = prev
  })

  test('does nothing when title empty', () => {
    vi.clearAllMocks()
    const d = globalThis.document
    const prev = d.title
    d.title = ''
    sendTitle()

    expect(sendMessage).not.toHaveBeenCalled()
    d.title = prev
  })
})
