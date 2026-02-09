import { describe, test, expect } from 'vitest'

const { getParentProps } = await import('./props')

describe('core/monitor/props', () => {
  test('getParentProps returns stringified viewport and document data', () => {
    document.documentElement.scrollWidth = 900
    document.documentElement.scrollHeight = 800
    window.visualViewport = { width: 100, height: 200, offsetLeft: 10, offsetTop: 20, pageLeft: 5, pageTop: 6, scale: 1 }
    const iframe = { getBoundingClientRect: () => ({ top: 1, left: 2 }) }
    const data = JSON.parse(getParentProps(iframe))
    expect(data.viewport.width).toBe(100)
    expect(data.document.scrollHeight).toBe(800)
  })
})
