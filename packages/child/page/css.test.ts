import { describe, expect, test, vi } from 'vitest'

import { checkCSS, setBodyStyle, setMargin } from './css'

vi.mock('../console', () => ({ info: vi.fn(), warn: vi.fn() }))

describe('child/page/css', () => {
  test('checkCSS strips negative values', () => {
    expect(checkCSS('margin', '-5px')).toBe('')
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
