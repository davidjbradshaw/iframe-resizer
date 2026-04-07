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
  default: { mode: 0 },
}))
vi.mock('../values/state', () => ({
  default: { inPageLinks: null },
}))
vi.mock('../../common/mode', () => ({
  checkMode: vi.fn(() => false),
  getModeData: vi.fn(),
}))

describe('child/page/links unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    state.inPageLinks = null
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
    test('adds click listeners to anchor elements with hash hrefs', () => {
      const a1 = document.createElement('a')
      a1.setAttribute('href', '#section1')
      const a2 = document.createElement('a')
      a2.setAttribute('href', '#section2')
      document.body.append(a1, a2)

      bindAnchors()

      expect(addEventListener).toHaveBeenCalledTimes(2)
      expect(vi.mocked(addEventListener).mock.calls[0][0]).toBe(a1)
      expect(vi.mocked(addEventListener).mock.calls[0][1]).toBe('click')
      expect(vi.mocked(addEventListener).mock.calls[1][0]).toBe(a2)
      expect(vi.mocked(addEventListener).mock.calls[1][1]).toBe('click')
    })

    test('skips anchors with href="#"', () => {
      const a1 = document.createElement('a')
      a1.setAttribute('href', '#')
      const a2 = document.createElement('a')
      a2.setAttribute('href', '#valid')
      document.body.append(a1, a2)

      bindAnchors()

      expect(addEventListener).toHaveBeenCalledTimes(1)
      expect(vi.mocked(addEventListener).mock.calls[0][0]).toBe(a2)
    })

    test('does nothing when no matching anchors exist', () => {
      const a = document.createElement('a')
      a.setAttribute('href', 'http://example.com')
      document.body.append(a)

      bindAnchors()

      expect(addEventListener).not.toHaveBeenCalled()
    })

    test('click handler calls findTarget and prevents default', () => {
      const target = document.createElement('div')
      target.id = 'clickTarget'
      document.body.append(target)

      const a = document.createElement('a')
      a.setAttribute('href', '#clickTarget')
      document.body.append(a)

      // Use real addEventListener to capture the handler
      let capturedHandler: (e: Event) => void
      vi.mocked(addEventListener).mockImplementation(
        (_el, _evt, handler: any) => {
          capturedHandler = handler
        },
      )

      bindAnchors()

      const mockEvent = { preventDefault: vi.fn() }
      capturedHandler!(mockEvent as unknown as Event)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(sendMessage).toHaveBeenCalled()
    })
  })
})
