import { beforeEach, describe, expect, test } from 'vitest'

import settings from '../values/settings'

describe('child/read/from-page', () => {
  beforeEach(() => {
    // reset page object
    delete window.iframeResizer
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

  test('reads offsetSize with calculateWidth=true', async () => {
    settings.calculateHeight = true
    settings.calculateWidth = true
    window.iframeResizer = {
      offsetSize: 15,
    }

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out.offsetHeight).toBe(15)
    expect(out.offsetWidth).toBe(15)
  })

  test('returns empty object when window.iframeResizer is not an object', async () => {
    window.iframeResizer = 'not an object'

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out).toEqual({})
  })

  test('returns empty object when window.iframeResizer is null', async () => {
    window.iframeResizer = null

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out).toEqual({})
  })

  test('returns empty object when window.iframeResizer is an array', async () => {
    window.iframeResizer = [1, 2, 3]

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out).toEqual({})
  })

  test('reads from window.iframeResizer (capital F)', async () => {
    window.iframeResizer = {
      targetOrigin: 'https://test.com',
    }

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out.targetOrigin).toBe('https://test.com')
  })

  test('reads offsetSize when calculateHeight=false and calculateWidth=true', async () => {
    settings.calculateHeight = false
    settings.calculateWidth = true
    window.iframeResizer = {
      offsetSize: 30,
    }

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out.offsetHeight).toBeUndefined()
    expect(out.offsetWidth).toBe(30)
  })

  test('does not set offsetSize when both calculateHeight and calculateWidth are false', async () => {
    settings.calculateHeight = false
    settings.calculateWidth = false
    window.iframeResizer = {
      offsetSize: 40,
    }

    const { default: readFromPage } = await import('./from-page')
    const out = readFromPage()

    expect(out.offsetHeight).toBeUndefined()
    expect(out.offsetWidth).toBeUndefined()
  })
})
