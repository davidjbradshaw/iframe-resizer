import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../send/message', () => ({ default: vi.fn() }))

const { log } = await import('../console')
const sendMessage = (await import('../send/message')).default
const { TITLE } = await import('../../common/consts')
const titleChanged = (await import('./title')).default

describe('child/observed/title', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('logs and sends message when title changes', () => {
    const prev = document.title
    document.title = 'My Page'
    titleChanged()
    document.title = prev

    expect(log).toHaveBeenCalled()
    expect(sendMessage).toHaveBeenCalledWith(0, 0, TITLE, 'My Page')
  })

  test('does not send message when title is empty', () => {
    const prev = document.title
    document.title = ''
    titleChanged()
    document.title = prev

    expect(log).toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  test('does not re-send when title has not changed', () => {
    const prev = document.title
    document.title = 'Unique Title'
    titleChanged()
    titleChanged()
    document.title = prev

    expect(sendMessage).toHaveBeenCalledTimes(1)
  })
})
