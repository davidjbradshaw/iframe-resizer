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
    settings.calculateHeight = true
    settings.maxContentWidth = false

    // Reset DOM
    document.body.innerHTML = ''

    // Mock getComputedStyle to return zero margins by default
    global.getComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '0',
    }))
  })

  describe('the width of a tagged element', () => {
    // A block that fills the body, in a section with 4px of padding and a
    // 1px border: its edge is 13px inside the page's own right edge
    const setUp = () => {
      const section = document.createElement('section')
      const block = document.createElement('div')
      section.append(block)
      document.body.append(section)
      block.getBoundingClientRect = () => ({ bottom: 0, right: 387 })

      const styles = new Map<Element, Record<string, string>>([
        [section, { 'padding-right': '4px', 'border-right-width': '1px' }],
        [document.body, { 'margin-right': '8px' }],
      ])
      global.getComputedStyle = vi.fn((el: Element) => ({
        getPropertyValue: (prop: string) => styles.get(el)?.[prop] ?? '0',
      }))

      state.hasTags = true
      state.taggedElements = [block]
      settings.calculateHeight = false
    }

    test('with horizontal-block, reaches the page edge, past the space around it', () => {
      setUp()

      expect(getMaxElement('right')).toBe(400)
    })

    test('with horizontal-inline, is its own edge, as the page fits its content', () => {
      setUp()
      settings.maxContentWidth = true

      expect(getMaxElement('right')).toBe(387)
    })
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

  test('leaves out an element marked data-iframe-ignore, even when it is the widest', () => {
    const content = document.createElement('p')
    const menu = document.createElement('nav')
    menu.toggleAttribute('data-iframe-ignore', true)
    const link = document.createElement('a')
    menu.append(link)

    content.getBoundingClientRect = () => ({ bottom: 0, right: 400 })
    menu.getBoundingClientRect = () => ({ bottom: 0, right: 700 })
    link.getBoundingClientRect = () => ({ bottom: 0, right: 650 })

    document.body.append(content, menu)

    expect(getMaxElement('right')).toBe(400)
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
    settings.calculateHeight = false
    settings.maxContentWidth = true
    state.hasOverflow = true
    const overflowed = document.createElement('div')
    overflowed.getBoundingClientRect = () => ({ bottom: 0, right: 330 })
    state.overflowedNodeSet = new Set([overflowed])
    mockContentRight({ body: 420, html: 438 })

    expect(getMaxElement('right')).toBe(438)
  })

  test('the floor follows the body when the page pins <html> wider', () => {
    settings.calculateHeight = false
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
    settings.calculateHeight = false
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
    settings.calculateHeight = false
    settings.maxContentWidth = false
    state.hasOverflow = true
    const overflowed = document.createElement('div')
    overflowed.getBoundingClientRect = () => ({ bottom: 0, right: 330 })
    state.overflowedNodeSet = new Set([overflowed])
    mockContentRight({ body: 900, html: 900 })

    expect(getMaxElement('right')).toBe(330)
  })

  // In 'both' mode the overflow observer watches the bottom edge only, so an
  // element overflowing it says nothing about which element is widest
  test('both: a bottom overflow does not narrow the width search to the overflowed element', () => {
    settings.calculateHeight = true
    state.hasOverflow = true
    const wide = document.createElement('div')
    const footer = document.createElement('div')
    wide.getBoundingClientRect = () => ({ bottom: 40, right: 800 })
    footer.getBoundingClientRect = () => ({ bottom: 1050, right: 100 })
    document.body.append(wide, footer)
    state.overflowedNodeSet = new Set([footer])

    expect(getMaxElement('right')).toBe(800)
    expect(getMaxElement('bottom')).toBe(1050)
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
