import { afterEach, beforeEach, describe, expect, test } from 'vitest'

const { getParentProps } = await import('./props')

describe('core/monitor/props', () => {
  let origViewport: VisualViewport | null

  beforeEach(() => {
    origViewport = window.visualViewport
  })

  afterEach(() => {
    window.visualViewport = origViewport
  })

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

  test('getParentProps uses default values when visualViewport is unavailable', () => {
    window.visualViewport = null

    const iframe = { getBoundingClientRect: () => ({ top: 0, left: 0 }) }
    const data = JSON.parse(getParentProps(iframe))

    expect(data.viewport.width).toBe(0)
    expect(data.viewport.height).toBe(0)
    expect(data.viewport.offsetLeft).toBe(0)
    expect(data.viewport.offsetTop).toBe(0)
    expect(data.viewport.pageLeft).toBe(0)
    expect(data.viewport.pageTop).toBe(0)
    expect(data.viewport.scale).toBe(1)
  })
})
