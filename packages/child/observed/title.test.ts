import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ event: vi.fn(), log: vi.fn() }))
vi.mock('../send/message', () => ({ default: vi.fn() }))

const { event, log } = await import('../console')
const sendMessage = (await import('../send/message')).default
const { TITLE } = await import('@iframe-resizer/common/consts')
const settings = (await import('../values/settings')).default
const titleChanged = (await import('./title')).default

describe('child/observed/title', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    settings.version = '6.0.0'
  })

  test('does not send the title to a parent before v5', () => {
    // It would read the unknown message as a size of 0
    delete settings.version
    const prev = document.title
    document.title = 'Legacy Parent'
    titleChanged()
    document.title = prev

    expect(sendMessage).not.toHaveBeenCalled()
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

    // With nothing sent, only the observer names the event
    expect(event).toHaveBeenCalledWith(TITLE)
    expect(vi.mocked(event).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(log).mock.invocationCallOrder[0],
    )
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
