import { describe, expect, it } from 'vitest'

import * as consts from './consts'

describe('common/consts', () => {
  it('has core identifiers and message lengths', () => {
    expect(consts.MESSAGE).toBe('message')
    expect(consts.MESSAGE_ID).toContain('iFrameSizer')
    expect(consts.MESSAGE_HEADER_LENGTH).toBe(consts.MESSAGE.length)
    expect(consts.MESSAGE_ID_LENGTH).toBe(consts.MESSAGE_ID.length)
  })

  it('provides event names and defaults', () => {
    expect(consts.INIT_EVENTS).toBeDefined()
    expect(consts.INIT_EVENTS).toHaveProperty(consts.ONLOAD, 1)
    expect(consts.INIT_EVENTS).toHaveProperty(consts.INIT, 1)
    expect(consts.INIT_EVENTS).toHaveProperty(consts.INIT_FROM_IFRAME, 1)
    expect(consts.HEIGHT_CALC_MODE_DEFAULT).toBe(consts.AUTO)
    expect(consts.WIDTH_CALC_MODE_DEFAULT).toBe(consts.SCROLL)
  })

  it('includes ignore and observer-related constants', () => {
    expect(consts.IGNORE_TAGS).toBeInstanceOf(Set)
    expect(consts.IGNORE_TAGS.has('script')).toBe(true)
    expect(consts.RESIZE_OBSERVER).toBe('resizeObserver')
    expect(consts.MUTATION_OBSERVER).toBe('mutationObserver')
    expect(consts.OVERFLOW_OBSERVER).toBe('overflowObserver')
  })

  it('defines resize request and disable rules', () => {
    expect(consts.MANUAL_RESIZE_REQUEST).toBe('manualResize')
    expect(consts.PARENT_RESIZE_REQUEST).toBe('parentResize')
    expect(consts.IGNORE_DISABLE_RESIZE).toHaveProperty(
      consts.MANUAL_RESIZE_REQUEST,
      1,
    )
    expect(consts.IGNORE_DISABLE_RESIZE).toHaveProperty(
      consts.PARENT_RESIZE_REQUEST,
      1,
    )
  })
})
