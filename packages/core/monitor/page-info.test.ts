import { describe, expect, test } from 'vitest'

const { getPageInfo } = await import('./page-info')

describe('core/monitor/page-info', () => {
  test('getPageInfo returns stringified metrics from DOM', () => {
    const iframe = {
      getBoundingClientRect: () => ({
        height: 100,
        width: 200,
        top: 10,
        left: 20,
      }),
    }
    document.body.getBoundingClientRect = () => ({ top: 5, left: 15 })
    Object.defineProperty(window, 'scrollY', { value: 1, configurable: true })
    Object.defineProperty(window, 'scrollX', { value: 2, configurable: true })
    Object.defineProperty(window, 'innerHeight', {
      value: 300,
      configurable: true,
    })
    Object.defineProperty(window, 'innerWidth', {
      value: 400,
      configurable: true,
    })
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 310,
      configurable: true,
    })
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 410,
      configurable: true,
    })

    const json = getPageInfo(iframe)
    const data = JSON.parse(json)

    expect(data.iframeHeight).toBe(100)
    expect(data.offsetTop).toBe(5)
    expect(data.scrollLeft).toBe(2)
  })

  test('getPageInfo handles undefined innerHeight/innerWidth', () => {
    const iframe = {
      getBoundingClientRect: () => ({
        height: 50,
        width: 100,
        top: 0,
        left: 0,
      }),
    }
    document.body.getBoundingClientRect = () => ({ top: 0, left: 0 })
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 500,
      configurable: true,
    })
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 600,
      configurable: true,
    })
    Object.defineProperty(window, 'innerHeight', {
      value: undefined,
      configurable: true,
    })
    Object.defineProperty(window, 'innerWidth', {
      value: undefined,
      configurable: true,
    })

    const json = getPageInfo(iframe)
    const data = JSON.parse(json)

    expect(data.clientHeight).toBe(500)
    expect(data.clientWidth).toBe(600)
  })
})
