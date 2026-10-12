import { afterEach, describe, expect, test } from 'vitest'

import withBoxSizing, { getBorderEnds, getPaddingEnds } from './box-sizing'

const BORDER_BOX = {
  boxSizing: 'border-box',
  paddingTop: '5px',
  paddingBottom: '3px',
  borderTopWidth: '2px',
  borderBottomWidth: '1px',
} as CSSStyleDeclaration

describe('core/events/box-sizing', () => {
  const origGetComputed = globalThis.getComputedStyle

  afterEach(() => {
    globalThis.getComputedStyle = origGetComputed
  })

  test('calculates padding and border ends', () => {
    expect(getPaddingEnds(BORDER_BOX)).toBe(8)
    expect(getBorderEnds(BORDER_BOX)).toBe(3)
  })

  test('returns 0 for padding and border when not border-box', () => {
    const contentBox = { ...BORDER_BOX, boxSizing: 'content-box' }

    expect(getPaddingEnds(contentBox)).toBe(0)
    expect(getBorderEnds(contentBox)).toBe(0)
  })

  test('handles missing padding and border values', () => {
    const bare = { boxSizing: 'border-box' } as CSSStyleDeclaration

    expect(getPaddingEnds(bare)).toBe(0)
    expect(getBorderEnds(bare)).toBe(0)
  })

  test('adds the padding and border of a border-box iframe to the height', () => {
    globalThis.getComputedStyle = () => BORDER_BOX
    const iframe = document.createElement('iframe')
    const messageData = { id: 'a', iframe, height: 100, width: 200, type: 'x' }

    expect(withBoxSizing(messageData)).toEqual({ ...messageData, height: 111 })
    // The message itself is left as it was sent
    expect(messageData.height).toBe(100)
  })

  test('leaves a message without an iframe as it is', () => {
    const messageData = { id: 'a', height: 100, width: 200, type: 'x' }

    expect(withBoxSizing(messageData)).toBe(messageData)
  })
})
