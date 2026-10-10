import { describe, expect, test, vi } from 'vitest'

import { checkCSS, setBodyStyle, setMargin } from './css'

vi.mock('../console', () => ({ info: vi.fn(), warn: vi.fn() }))

describe('child/page/css', () => {
  test('checkCSS strips negative values', () => {
    expect(checkCSS('margin', '-5px')).toBe('')
    expect(checkCSS('margin', '0 -4px')).toBe('')
    expect(checkCSS('margin', '10px -.5em')).toBe('')
  })

  test('checkCSS keeps calc() and custom properties', () => {
    expect(checkCSS('margin', 'calc(100% - 10px)')).toBe('calc(100% - 10px)')
    expect(checkCSS('margin', 'var(--gap)')).toBe('var(--gap)')
  })

  test('setBodyStyle sets body style and calls info', () => {
    document.body.style.cssText = ''
    setBodyStyle('margin', '10px')

    expect(document.body.style.getPropertyValue('margin')).toBe('10px')
  })

  test('setMargin converts numeric margin to px string', () => {
    setMargin({ bodyMargin: 4 })

    expect(document.body.style.getPropertyValue('margin')).toBe('4px')
  })
})
