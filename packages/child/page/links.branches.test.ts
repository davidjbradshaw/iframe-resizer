/* eslint import/extensions: 0 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { IN_PAGE_LINK, SCROLL_TO_OFFSET } from '../../common/consts'
import sendMessage from '../send/message'
import settings from '../values/settings'
import state from '../values/state'
import setupInPageLinks from './links'

vi.useFakeTimers()

vi.mock('../send/message', () => ({ default: vi.fn() }))
vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn() }))

describe('child/page/links branches', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
    state.inPageLinks = undefined
    settings.mode = 0
    sendMessage.mockClear()
  })

  it('enabled=false logs and does not set up handlers', () => {
    setupInPageLinks(false)

    expect(state.inPageLinks).toBeUndefined()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('mode=1 path advises and skips setup', async () => {
    const consoleMod = await import('../console')
    settings.mode = 1
    setupInPageLinks(true)

    expect(consoleMod.advise).toHaveBeenCalled()
    expect(state.inPageLinks).toBeUndefined()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('binds anchors and hashchange; initCheck triggers hash processing', () => {
    // Create anchor and target
    const anchor = document.createElement('a')
    anchor.setAttribute('href', '#hash1')
    anchor.textContent = 'go'
    document.body.append(anchor)

    setupInPageLinks(true)

    // Simulate clicking the anchor (prevents default and calls findTarget)
    anchor.click()

    // Not found path: sends IN_PAGE_LINK to parent
    expect(sendMessage).toHaveBeenCalledWith(0, 0, IN_PAGE_LINK, '#hash1')

    // Now ensure initCheck will process window.location.hash
    // Set a matching target so jump path is taken when checkLocationHash runs
    const target = document.createElement('div')
    target.id = 'hash2'
    target.getBoundingClientRect = () => ({ left: 10, top: 20 })
    document.body.append(target)

    // Configure location and trigger hashchange binding (no href assignment)
    window.location.hash = '#hash2'
    window.dispatchEvent(new Event('hashchange'))

    // Jump path sends SCROLL_TO_OFFSET with reversed x/y
    expect(sendMessage).toHaveBeenCalledWith(20, 10, SCROLL_TO_OFFSET)
  })

  it('findTarget jumps when element exists', () => {
    // Enable and use state.inPageLinks.findTarget
    const target = document.createElement('div')
    target.id = 'found'
    target.getBoundingClientRect = () => ({ left: 7, top: 11 })
    document.body.append(target)

    setupInPageLinks(true)

    state.inPageLinks.findTarget('#found')

    expect(sendMessage).toHaveBeenCalledWith(11, 7, SCROLL_TO_OFFSET)
  })

  it('findTarget works with hash without # prefix', () => {
    const target = document.createElement('div')
    target.id = 'nohash'
    target.getBoundingClientRect = () => ({ left: 5, top: 15 })
    document.body.append(target)

    setupInPageLinks(true)

    // Pass location without # prefix
    state.inPageLinks.findTarget('nohash')

    expect(sendMessage).toHaveBeenCalledWith(15, 5, SCROLL_TO_OFFSET)
  })

  it('findTarget finds element by name attribute', () => {
    const target = document.createElement('div')
    target.setAttribute('name', 'byname')
    target.getBoundingClientRect = () => ({ left: 3, top: 9 })
    document.body.append(target)

    setupInPageLinks(true)

    state.inPageLinks.findTarget('#byname')

    expect(sendMessage).toHaveBeenCalledWith(9, 3, SCROLL_TO_OFFSET)
  })

  it('skips anchors with href="#" during binding', () => {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', '#')
    document.body.append(anchor)

    setupInPageLinks(true)

    // Click the anchor - should not call sendMessage since it's skipped
    const clickEvent = new Event('click', { bubbles: true, cancelable: true })
    anchor.dispatchEvent(clickEvent)

    // sendMessage should not be called for href="#"
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('checkLocationHash does nothing when hash is empty', () => {
    window.location.hash = ''

    setupInPageLinks(true)

    // Trigger hashchange with empty hash
    window.dispatchEvent(new Event('hashchange'))

    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('checkLocationHash does nothing when hash is just #', () => {
    window.location.hash = '#'

    setupInPageLinks(true)

    // Trigger hashchange with just #
    window.dispatchEvent(new Event('hashchange'))

    expect(sendMessage).not.toHaveBeenCalled()
  })
})
