import { describe, expect, test } from 'vitest'

const { getParentProps } = await import('./props')

describe('core/monitor/props', () => {
  test('getParentProps returns stringified viewport and document data', () => {
    Object.defineProperty(document.documentElement, 'scrollWidth', {
      configurable: true,
      get: () => 900,
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get: () => 800,
    })
    window.visualViewport = {
      width: 100,
      height: 200,
      offsetLeft: 10,
      offsetTop: 20,
      pageLeft: 5,
      pageTop: 6,
      scale: 1,
    }
    const iframe = { getBoundingClientRect: () => ({ top: 1, left: 2 }) }
    const data = JSON.parse(getParentProps(iframe))

    expect(data.viewport.width).toBe(100)
    expect(data.document.scrollHeight).toBe(800)
  })
})
