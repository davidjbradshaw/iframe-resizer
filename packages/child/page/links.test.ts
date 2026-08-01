import { beforeEach, describe, expect, test, vi } from 'vitest'

import sendMessage from '../send/message'
import settings from '../values/settings'
import state from '../values/state'
import setupInPageLinks from './links'

vi.mock('../console', () => ({ log: vi.fn(), advise: vi.fn() }))
vi.mock('../send/message', () => ({ __esModule: true, default: vi.fn() }))

describe('child/page/links', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    settings.mode = 0
  })

  test('setup and findTarget sends message for existing id', () => {
    const target = document.createElement('div')
    target.id = 't1'
    document.body.append(target)

    const a = document.createElement('a')
    a.setAttribute('href', '#t1')
    document.body.append(a)

    setupInPageLinks(true)
    // use the registered finder directly
    state.inPageLinks.findTarget('#t1')

    expect(sendMessage).toHaveBeenCalled()
  })
})
