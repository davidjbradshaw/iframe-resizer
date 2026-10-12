import { afterEach, describe, expect, test } from 'vitest'

import withBoxSizing, { getBoxEnds } from './box-sizing'

const BORDER_BOX = {
  boxSizing: 'border-box',
  paddingTop: '5px',
  paddingBottom: '3px',
  borderTopWidth: '2px',
  borderBottomWidth: '1px',
  paddingLeft: '7px',
  paddingRight: '6px',
  borderLeftWidth: '4px',
  borderRightWidth: '2px',
} as CSSStyleDeclaration

describe('core/events/box-sizing', () => {
  const origGetComputed = globalThis.getComputedStyle

  afterEach(() => {
    globalThis.getComputedStyle = origGetComputed
  })

  test('adds up the padding and border on each axis', () => {
    expect(getBoxEnds(BORDER_BOX, 'Top', 'Bottom')).toBe(11)
    expect(getBoxEnds(BORDER_BOX, 'Left', 'Right')).toBe(19)
  })

  test('returns 0 when not border-box', () => {
    const contentBox = { ...BORDER_BOX, boxSizing: 'content-box' }

    expect(getBoxEnds(contentBox, 'Top', 'Bottom')).toBe(0)
    expect(getBoxEnds(contentBox, 'Left', 'Right')).toBe(0)
  })

  test('handles missing padding and border values', () => {
    const bare = { boxSizing: 'border-box' } as CSSStyleDeclaration

    expect(getBoxEnds(bare, 'Top', 'Bottom')).toBe(0)
    expect(getBoxEnds(bare, 'Left', 'Right')).toBe(0)
  })

  test('adds the padding and border of a border-box iframe to its size', () => {
    globalThis.getComputedStyle = () => BORDER_BOX
    const iframe = document.createElement('iframe')
    const messageData = { id: 'a', iframe, height: 100, width: 200, type: 'x' }

    expect(withBoxSizing(messageData)).toEqual({
      ...messageData,
      height: 111,
      width: 219,
    })
    // The message itself is left as it was sent
    expect(messageData).toMatchObject({ height: 100, width: 200 })
  })

  test('leaves a message without an iframe as it is', () => {
    const messageData = { id: 'a', height: 100, width: 200, type: 'x' }

    expect(withBoxSizing(messageData)).toBe(messageData)
  })
})
