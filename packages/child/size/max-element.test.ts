import { beforeEach, describe, expect, test, vi } from 'vitest'

import state from '../values/state'
import getMaxElement from './max-element'

describe('child/size/max-element', () => {
  beforeEach(() => {
    state.hasTags = false
    state.hasOverflow = false
    state.overflowedNodeSet = new Set()
    state.taggedElements = []

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
