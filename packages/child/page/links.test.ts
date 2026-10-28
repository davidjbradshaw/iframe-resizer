import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as consoleMod from '../console'
import sendMessage from '../send/message'
import settings from '../values/settings'
import state from '../values/state'
import setupInPageLinks, { findTarget } from './links'

vi.mock('../console', () => ({ log: vi.fn(), advise: vi.fn() }))
vi.mock('../send/message', () => ({ __esModule: true, default: vi.fn() }))

describe('child/page/links', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    settings.mode = 0
    settings.inPageLinks = true
    state.findInPageLinkTarget = null
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
    state.findInPageLinkTarget('#t1')

    expect(sendMessage).toHaveBeenCalled()
  })

  test('findTarget no-op when inPageLinks setting becomes false', () => {
    settings.inPageLinks = false
    findTarget('#nope')

    expect(sendMessage).not.toHaveBeenCalled()
  })

  test('does nothing when in page links are already wired up', () => {
    const existing = vi.fn()
    state.findInPageLinkTarget = existing
    const addListener = vi.spyOn(document, 'addEventListener')
    // A mode that would otherwise be advised against
    settings.mode = 1

    setupInPageLinks(true)

    expect(state.findInPageLinkTarget).toBe(existing)
    expect(consoleMod.advise).not.toHaveBeenCalled()
    expect(consoleMod.log).not.toHaveBeenCalled()
    expect(addListener).not.toHaveBeenCalled()
    addListener.mockRestore()
  })
})
