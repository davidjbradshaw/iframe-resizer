import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../send/title', () => ({ default: vi.fn() }))

const { log } = await import('../console')
const sendTitle = (await import('../send/title')).default
const titleChanged = (await import('./title')).default

describe('child/observed/title', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('logs the current title and calls sendTitle', () => {
    const prev = document.title
    document.title = 'My Page'

    titleChanged()

    expect(log).toHaveBeenCalled()
    expect(sendTitle).toHaveBeenCalled()

    document.title = prev
  })

  test('calls sendTitle even when title is empty', () => {
    const prev = document.title
    document.title = ''

    titleChanged()

    expect(sendTitle).toHaveBeenCalled()

    document.title = prev
  })
})
