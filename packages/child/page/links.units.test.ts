import { beforeEach, describe, expect, test, vi } from 'vitest'

import { addEventListener } from '../events/listeners'
import sendMessage from '../send/message'
import state from '../values/state'
import {
  bindAnchors,
  checkLocationHash,
  findTarget,
  getElementPosition,
  getPagePosition,
} from './links'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn() }))
vi.mock('../send/message', () => ({ __esModule: true, default: vi.fn() }))
vi.mock('../events/listeners', () => ({ addEventListener: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { mode: 0, inPageLinks: true },
}))
vi.mock('../values/state', () => ({
  default: { findInPageLinkTarget: null },
}))
vi.mock('../../common/mode', () => ({
  checkMode: vi.fn(() => false),
  getModeData: vi.fn(),
}))

describe('child/page/links unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    state.findInPageLinkTarget = null
  })

  describe('getPagePosition', () => {
    test('returns x and y from documentElement scroll', () => {
      Object.defineProperty(document.documentElement, 'scrollLeft', {
        value: 10,
        configurable: true,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        value: 20,
        configurable: true,
      })

      const pos = getPagePosition()

      expect(pos).toEqual({ x: 10, y: 20 })

      // Clean up
      Object.defineProperty(document.documentElement, 'scrollLeft', {
        value: 0,
        configurable: true,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        value: 0,
        configurable: true,
      })
    })

    test('returns zeros when no scroll', () => {
      const pos = getPagePosition()
      expect(pos).toEqual({ x: 0, y: 0 })
    })
  })

  describe('getElementPosition', () => {
    test('returns position from getBoundingClientRect plus page scroll', () => {
      Object.defineProperty(document.documentElement, 'scrollLeft', {
        value: 5,
        configurable: true,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        value: 15,
        configurable: true,
      })

      const el = document.createElement('div')
      el.getBoundingClientRect = () => ({
        left: 100,
        top: 200,
        right: 150,
        bottom: 250,
        width: 50,
        height: 50,
        x: 100,
        y: 200,
        toJSON() {},
      })

      const pos = getElementPosition(el)

      // parseInt is used in the source on these values
      expect(pos).toEqual({ x: 105, y: 215 })

      Object.defineProperty(document.documentElement, 'scrollLeft', {
        value: 0,
        configurable: true,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        value: 0,
        configurable: true,
      })
    })

    test('returns rect values when page has no scroll', () => {
      const el = document.createElement('div')
      el.getBoundingClientRect = () => ({
        left: 30,
        top: 40,
        right: 80,
        bottom: 90,
        width: 50,
        height: 50,
        x: 30,
        y: 40,
        toJSON() {},
      })

      const pos = getElementPosition(el)

      expect(pos).toEqual({ x: 30, y: 40 })
    })
  })

  describe('findTarget', () => {
    test('calls sendMessage when target element exists by id', () => {
      const target = document.createElement('div')
      target.id = 'section1'
      document.body.append(target)

      findTarget('#section1')

      expect(sendMessage).toHaveBeenCalled()
      // sendMessage is called with (y, x, SCROLL_TO_OFFSET)
      expect(vi.mocked(sendMessage).mock.calls[0][2]).toBe('scrollToOffset')
    })

    test('sends in-page link message when target not found', () => {
      findTarget('#nonexistent')

      expect(sendMessage).toHaveBeenCalledWith(
        0,
        0,
        'inPageLink',
        '#nonexistent',
      )
    })

    test('handles location string without hash prefix', () => {
      const target = document.createElement('div')
      target.id = 'myTarget'
      document.body.append(target)

      findTarget('myTarget')

      expect(sendMessage).toHaveBeenCalled()
      expect(vi.mocked(sendMessage).mock.calls[0][2]).toBe('scrollToOffset')
    })

    test('handles encoded hash values', () => {
      const target = document.createElement('div')
      target.id = 'my section'
      document.body.append(target)

      findTarget('#my%20section')

      expect(sendMessage).toHaveBeenCalled()
      expect(vi.mocked(sendMessage).mock.calls[0][2]).toBe('scrollToOffset')
    })

    test('finds target by name attribute when id not found', () => {
      const target = document.createElement('a')
      target.setAttribute('name', 'namedAnchor')
      document.body.append(target)

      findTarget('#namedAnchor')

      expect(sendMessage).toHaveBeenCalled()
      expect(vi.mocked(sendMessage).mock.calls[0][2]).toBe('scrollToOffset')
    })
  })

  describe('checkLocationHash', () => {
    test('calls findTarget when location has a hash', () => {
      const originalLocation = window.location

      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          hash: '#test',
          href: 'http://localhost/#test',
        },
        configurable: true,
        writable: true,
      })

      checkLocationHash()

      expect(sendMessage).toHaveBeenCalled()

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      })
    })

    test('does nothing when hash is empty', () => {
      const originalLocation = window.location

      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          hash: '',
          href: 'http://localhost/',
        },
        configurable: true,
        writable: true,
      })

      checkLocationHash()

      expect(sendMessage).not.toHaveBeenCalled()

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      })
    })

    test('does nothing when hash is just #', () => {
      const originalLocation = window.location

      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          hash: '#',
          href: 'http://localhost/#',
        },
        configurable: true,
        writable: true,
      })

      checkLocationHash()

      expect(sendMessage).not.toHaveBeenCalled()

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      })
    })
  })

  describe('bindAnchors', () => {
    test('attaches a single delegated click listener on document', () => {
      bindAnchors()

      expect(addEventListener).toHaveBeenCalledTimes(1)
      expect(vi.mocked(addEventListener).mock.calls[0][0]).toBe(document)
      expect(vi.mocked(addEventListener).mock.calls[0][1]).toBe('click')
    })

    function captureDelegatedHandler(): (e: Event) => void {
      let captured: (e: Event) => void
      vi.mocked(addEventListener).mockImplementation(
        (_el, _evt, handler: any) => {
          captured = handler
        },
      )
      bindAnchors()
      return captured!
    }

    test('handler calls findTarget and prevents default for hash anchor', () => {
      const target = document.createElement('div')
      target.id = 'clickTarget'
      document.body.append(target)

      const a = document.createElement('a')
      a.setAttribute('href', '#clickTarget')
      document.body.append(a)

      const handler = captureDelegatedHandler()
      const mockEvent = { target: a, preventDefault: vi.fn() }
      handler(mockEvent as unknown as Event)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(sendMessage).toHaveBeenCalled()
    })

    test('handler ignores anchor with href="#"', () => {
      const a = document.createElement('a')
      a.setAttribute('href', '#')
      document.body.append(a)

      const handler = captureDelegatedHandler()
      const mockEvent = { target: a, preventDefault: vi.fn() }
      handler(mockEvent as unknown as Event)

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(sendMessage).not.toHaveBeenCalled()
    })

    test('handler ignores clicks outside hash anchors', () => {
      const div = document.createElement('div')
      document.body.append(div)

      const handler = captureDelegatedHandler()
      const mockEvent = { target: div, preventDefault: vi.fn() }
      handler(mockEvent as unknown as Event)

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(sendMessage).not.toHaveBeenCalled()
    })

    test('handler walks up to find ancestor hash anchor', () => {
      const target = document.createElement('div')
      target.id = 'nested'
      document.body.append(target)

      const a = document.createElement('a')
      a.setAttribute('href', '#nested')
      const inner = document.createElement('span')
      a.append(inner)
      document.body.append(a)

      const handler = captureDelegatedHandler()
      const mockEvent = { target: inner, preventDefault: vi.fn() }
      handler(mockEvent as unknown as Event)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(sendMessage).toHaveBeenCalled()
    })

    test('handler is a no-op when settings.inPageLinks is false', async () => {
      const settingsMod = (await import('../values/settings')).default
      settingsMod.inPageLinks = false

      const a = document.createElement('a')
      a.setAttribute('href', '#x')
      document.body.append(a)

      const handler = captureDelegatedHandler()
      const mockEvent = { target: a, preventDefault: vi.fn() }
      handler(mockEvent as unknown as Event)

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(sendMessage).not.toHaveBeenCalled()

      settingsMod.inPageLinks = true
    })
  })
})
