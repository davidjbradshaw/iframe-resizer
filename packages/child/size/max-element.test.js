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
})
