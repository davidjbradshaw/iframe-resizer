import { beforeEach, describe, expect, test, vi } from 'vitest'

import settings from '../values/settings'
import state from '../values/state'
import getMaxElement from './max-element'

describe('child/size/max-element', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    state.hasTags = false
    state.hasOverflow = false
    state.overflowedNodeSet = new Set()
    state.taggedElements = []
    settings.maxContentWidth = false

    // Reset DOM
    document.body.innerHTML = ''

    // Mock getComputedStyle to return zero margins by default
    global.getComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '0',
    }))
  })

  test('returns max bottom among elements', () => {
    const a = document.createElement('div')
    const b = document.createElement('div')
    const c = document.createElement('div')

    a.getBoundingClientRect = () => ({ bottom: 100, right: 0 })
    b.getBoundingClientRect = () => ({ bottom: 280, right: 0 })
    c.getBoundingClientRect = () => ({ bottom: 200, right: 0 })

    document.body.append(a, b, c)

    const val = getMaxElement('bottom')

    expect(val).toBe(280)
  })

  test('includes margin in calculation', () => {
    const d = document.createElement('div')
    d.getBoundingClientRect = () => ({ bottom: 250, right: 0 })
    document.body.append(d)

    // Return margin-bottom: 10px
    global.getComputedStyle = vi.fn(() => ({ getPropertyValue: () => '10' }))
    const val = getMaxElement('bottom')

    expect(val).toBe(260)
  })

  test('uses taggedElements when hasTags is true', () => {
    state.hasTags = true

    const tagged1 = document.createElement('div')
    const tagged2 = document.createElement('div')

    tagged1.getBoundingClientRect = () => ({ bottom: 300, right: 0 })
    tagged2.getBoundingClientRect = () => ({ bottom: 400, right: 0 })

    state.taggedElements = [tagged1, tagged2]

    const val = getMaxElement('bottom')

    expect(val).toBe(400)
  })

  test('uses MIN_SIZE as initial value when hasTags is true', () => {
    state.hasTags = true
    state.taggedElements = []

    // Mock document element
    document.documentElement.getBoundingClientRect = () => ({ bottom: 500 })

    const val = getMaxElement('bottom')

    // When hasTags is true, maxVal starts at MIN_SIZE (which is 1)
    // Since taggedElements is empty, no elements are checked, so it returns MIN_SIZE
    expect(val).toBe(1)
  })

  test('uses overflowedNodeSet when hasOverflow is true', () => {
    state.hasOverflow = true

    const overflow1 = document.createElement('div')
    const overflow2 = document.createElement('div')

    overflow1.getBoundingClientRect = () => ({ bottom: 350, right: 0 })
    overflow2.getBoundingClientRect = () => ({ bottom: 450, right: 0 })

    state.overflowedNodeSet = new Set([overflow1, overflow2])

    // Also need to mock document.documentElement for initial maxVal
    document.documentElement.getBoundingClientRect = () => ({ bottom: 100 })

    const val = getMaxElement('bottom')

    expect(val).toBe(450)
  })

  test('does not floor a width at the document height', () => {
    const wide = document.createElement('div')
    const narrow = document.createElement('div')
    wide.getBoundingClientRect = () => ({ bottom: 0, right: 300 })
    narrow.getBoundingClientRect = () => ({ bottom: 0, right: 120 })
    document.body.append(wide, narrow)

    // A page taller than it is wide
    document.documentElement.getBoundingClientRect = () => ({
      bottom: 900,
      right: 1024,
    })

    expect(getMaxElement('right')).toBe(300)
  })

  // The floor for a content-sized page: <body>'s right edge plus its right
  // margin and <html>'s right padding and border
  function mockContentRight({ body, html }) {
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      right: body,
    })
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue(
      { bottom: 0, right: html },
    )
    global.getComputedStyle = vi.fn((el) => ({
      getPropertyValue: (property) => {
        if (el === document.body && property === 'margin-right') return '8px'
        if (el === document.documentElement && property === 'padding-right')
          return '10px'
        return '0'
      },
    }))
  }

  test('floors a content-sized width at the body edge, not the overflowed element', () => {
    settings.maxContentWidth = true
    state.hasOverflow = true
    const overflowed = document.createElement('div')
    overflowed.getBoundingClientRect = () => ({ bottom: 0, right: 330 })
    state.overflowedNodeSet = new Set([overflowed])
    mockContentRight({ body: 420, html: 438 })

    expect(getMaxElement('right')).toBe(438)
  })

  test('the floor follows the body when the page pins <html> wider', () => {
    settings.maxContentWidth = true
    state.hasOverflow = true
    const overflowed = document.createElement('div')
    overflowed.getBoundingClientRect = () => ({ bottom: 0, right: 330 })
    state.overflowedNodeSet = new Set([overflowed])
    // e.g. html { min-width: 100% } keeps <html> at the iframe's 900px
    mockContentRight({ body: 420, html: 900 })

    expect(getMaxElement('right')).toBe(438)
  })

  test('an overflowed element wider than the page still sets the width', () => {
    settings.maxContentWidth = true
    state.hasOverflow = true
    const overflowed = document.createElement('div')
    overflowed.getBoundingClientRect = () => ({ bottom: 0, right: 800 })
    state.overflowedNodeSet = new Set([overflowed])
    mockContentRight({ body: 420, html: 438 })

    expect(getMaxElement('right')).toBe(800)
  })

  test('a tagged element sets the width with no floor', () => {
    settings.maxContentWidth = true
    state.hasTags = true
    const tagged = document.createElement('div')
    tagged.getBoundingClientRect = () => ({ bottom: 0, right: 300 })
    state.taggedElements = [tagged]
    mockContentRight({ body: 420, html: 438 })

    expect(getMaxElement('right')).toBe(300)
  })

  test('a block width has no floor', () => {
    settings.maxContentWidth = false
    state.hasOverflow = true
    const overflowed = document.createElement('div')
    overflowed.getBoundingClientRect = () => ({ bottom: 0, right: 330 })
    state.overflowedNodeSet = new Set([overflowed])
    mockContentRight({ body: 900, html: 900 })

    expect(getMaxElement('right')).toBe(330)
  })

  test('converts overflowedNodeSet to array', () => {
    state.hasOverflow = true

    const node1 = document.createElement('div')
    const node2 = document.createElement('div')
    const node3 = document.createElement('div')

    node1.getBoundingClientRect = () => ({ bottom: 100, right: 0 })
    node2.getBoundingClientRect = () => ({ bottom: 200, right: 0 })
    node3.getBoundingClientRect = () => ({ bottom: 150, right: 0 })

    state.overflowedNodeSet = new Set([node1, node2, node3])

    // Mock document.documentElement for initial maxVal
    document.documentElement.getBoundingClientRect = () => ({ bottom: 50 })

    const val = getMaxElement('bottom')

    expect(val).toBe(200)
  })
})
