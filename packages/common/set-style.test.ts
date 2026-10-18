import { describe, expect, test } from 'vitest'

import setStyleKeepingSize from './set-style'

const sizedElement = (): HTMLElement => {
  const el = document.createElement('iframe')
  el.style.setProperty('height', '800px')
  el.style.setProperty('width', '600px')
  el.style.setProperty('overflow', 'auto')
  return el
}

describe('common/set-style', () => {
  test('applies the style and keeps the size core set', () => {
    const el = sizedElement()

    setStyleKeepingSize(el, 'border: 2px solid red')

    expect(el.style.borderTopWidth).toBe('2px')
    expect(el.style.height).toBe('800px')
    expect(el.style.width).toBe('600px')
    expect(el.style.overflow).toBe('auto')
  })

  test('a style that sets a managed property wins over the kept value', () => {
    const el = sizedElement()

    setStyleKeepingSize(el, 'height: 50px')

    expect(el.style.height).toBe('50px')
    expect(el.style.width).toBe('600px')
  })

  test('keeps the priority of a restored property', () => {
    const el = document.createElement('iframe')
    el.style.setProperty('height', '800px', 'important')

    setStyleKeepingSize(el, 'color: red')

    expect(el.style.getPropertyValue('height')).toBe('800px')
    expect(el.style.getPropertyPriority('height')).toBe('important')
  })

  test('clears the other styles when the style is removed', () => {
    const el = sizedElement()
    el.style.setProperty('color', 'red')

    setStyleKeepingSize(el, null)

    expect(el.style.getPropertyValue('color')).toBe('')
    expect(el.style.height).toBe('800px')
  })
})
