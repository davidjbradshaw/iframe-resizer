import { beforeEach, describe, expect, test } from 'vitest'

import settings from '../values/settings'

describe('child/read/from-page', () => {
  beforeEach(() => {
    // reset page object
    delete window.iframeResizer
    delete window.iFrameResizer
    settings.mode = 0
    settings.calculateHeight = true
    settings.calculateWidth = false
  })

  test('returns empty object when mode === 1', async () => {
    settings.mode = 1
    const { default: readFromPage } = await import('./from-page')

    expect(readFromPage()).toEqual({})
  })

  test('reads values from window.iframeResizer and applies offsetSize', async () => {
    window.iframeResizer = {
      ignoreSelector: '.x',
      sizeSelector: '#y',
      targetOrigin: 'https://example.com',
      offsetSize: 5,
      heightCalculationMethod: 'auto',
      widthCalculationMethod: 'scroll',
      onMessage: () => {},
      onReady: () => {},
      onBeforeResize: () => 1,
    }

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out.ignoreSelector).toBe('.x')
    expect(out.sizeSelector).toBe('#y')
    expect(out.targetOrigin).toBe('https://example.com')
    expect(out.offsetHeight).toBe(5)
    // calculateWidth is false by default so width offset omitted
    expect(out.offsetWidth).toBeUndefined()
    expect(out.heightCalcMode).toBe('auto')
    expect(out.widthCalcMode).toBe('scroll')
    expect(typeof out.onMessage).toBe('function')
    expect(typeof out.onReady).toBe('function')
    expect(typeof out.onBeforeResize).toBe('function')
  })

  test('throws TypeError when value is wrong type', async () => {
    window.iframeResizer = {
      targetOrigin: 123, // should be string
    }

    const { default: readFromPage } = await import('./from-page')

    expect(() => readFromPage()).toThrow(TypeError)
    expect(() => readFromPage()).toThrow('targetOrigin is not a string')
  })

  test('reads deprecated offset option', async () => {
    settings.calculateHeight = true
    settings.calculateWidth = true
    window.iframeResizer = {
      offset: 10,
    }

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out.offsetHeight).toBe(10)
    expect(out.offsetWidth).toBe(10)
  })
})
