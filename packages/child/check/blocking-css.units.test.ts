import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  crossOriginStylesheetError,
  getElementName,
  getInlineStyleValue,
  getSetCSSPropertyValue,
  getStyleSheetCSSPropertyValue,
  hasBlockingCSS,
  hasCssValue,
} from './blocking-css'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn() }))

describe('blocking-css exported functions', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let consoleMod: typeof import('../console')

  beforeEach(async () => {
    vi.clearAllMocks()
    consoleMod = await import('../console')
    document.head.innerHTML = ''
  })

  afterEach(() => {
    document.head.innerHTML = ''
  })

  describe('hasCssValue', () => {
    test('returns false for empty string', () => {
      expect(hasCssValue('')).toBe(false)
    })

    test('returns false for 0px', () => {
      expect(hasCssValue('0px')).toBe(false)
    })

    test('returns false for auto', () => {
      expect(hasCssValue('auto')).toBe(false)
    })

    test('returns false for none', () => {
      expect(hasCssValue('none')).toBe(false)
    })

    test('returns true for 100px', () => {
      expect(hasCssValue('100px')).toBe(true)
    })

    test('returns false for undefined', () => {
      expect(hasCssValue(undefined as unknown as string)).toBe(false)
    })

    test('returns false for null', () => {
      expect(hasCssValue(null as unknown as string)).toBe(false)
    })

    test('returns true for a non-trivial value like 50%', () => {
      expect(hasCssValue('50%')).toBe(true)
    })
  })

  describe('getElementName', () => {
    test('returns lowercase tagName for a div', () => {
      const div = document.createElement('div')
      expect(getElementName(div)).toBe('div')
    })

    test('returns lowercase tagName for a section', () => {
      const section = document.createElement('section')
      expect(getElementName(section)).toBe('section')
    })

    test('returns unknown when tagName is absent', () => {
      const node = {} as Element
      expect(getElementName(node)).toBe('unknown')
    })
  })

  describe('hasBlockingCSS', () => {
    test('returns true when computed style has a blocking value', () => {
      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => '200px',
      })

      const div = document.createElement('div')
      expect(hasBlockingCSS(div, 'min-height')).toBe(true)

      window.getComputedStyle = originalGetComputedStyle
    })

    test('returns false when computed style is 0px', () => {
      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => '0px',
      })

      const div = document.createElement('div')
      expect(hasBlockingCSS(div, 'min-height')).toBe(false)

      window.getComputedStyle = originalGetComputedStyle
    })

    test('returns false when computed style is auto', () => {
      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => 'auto',
      })

      const div = document.createElement('div')
      expect(hasBlockingCSS(div, 'max-width')).toBe(false)

      window.getComputedStyle = originalGetComputedStyle
    })
  })

  describe('getInlineStyleValue', () => {
    test('returns source and value for element with inline style', () => {
      const div = document.createElement('div')
      div.style.minWidth = '100px'

      const result = getInlineStyleValue(div, 'minWidth')
      expect(result).toEqual({
        source: 'an inline style attribute',
        value: '100px',
      })
    })

    test('returns null for element without inline style', () => {
      const div = document.createElement('div')

      const result = getInlineStyleValue(div, 'minWidth')
      expect(result).toBeNull()
    })
  })

  describe('crossOriginStylesheetError', () => {
    test('logs for a new href', () => {
      crossOriginStylesheetError({ href: 'https://unique-a.com/style.css' })
      expect(consoleMod.log).toHaveBeenCalledWith(
        'Unable to access stylesheet:',
        'https://unique-a.com/style.css',
      )
    })

    test('only logs once for the same href', () => {
      const href = 'https://unique-b.com/once.css'
      crossOriginStylesheetError({ href })
      crossOriginStylesheetError({ href })

      expect(consoleMod.log).toHaveBeenCalledTimes(1)
    })

    test('logs separately for different hrefs', () => {
      crossOriginStylesheetError({ href: 'https://unique-c.com/a.css' })
      crossOriginStylesheetError({ href: 'https://unique-d.com/b.css' })

      expect(consoleMod.log).toHaveBeenCalledTimes(2)
    })
  })

  describe('getStyleSheetCSSPropertyValue', () => {
    let originalStyleSheets: StyleSheetList
    let originalGetComputedStyle: typeof window.getComputedStyle

    beforeEach(() => {
      originalStyleSheets = document.styleSheets
      originalGetComputedStyle = window.getComputedStyle
    })

    const cleanup = () => {
      Object.defineProperty(document, 'styleSheets', {
        value: originalStyleSheets,
        configurable: true,
      })
      window.getComputedStyle = originalGetComputedStyle
    }

    test('returns matching rule from inline style block', () => {
      const styleNode = document.createElement('style')

      const mockStyleSheet = {
        ownerNode: styleNode,
        href: null,
        cssRules: [
          {
            selectorText: 'div',
            style: { 'min-height': '300px' },
          },
        ],
      }

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      })

      const div = document.createElement('div')
      const result = getStyleSheetCSSPropertyValue(div, 'min-height')

      expect(result).toEqual({
        source: 'an inline <style> block',
        value: '300px',
      })

      cleanup()
    })

    test('returns matching rule from external stylesheet', () => {
      const linkNode = document.createElement('link')

      const mockStyleSheet = {
        ownerNode: linkNode,
        href: 'https://example.com/main.css',
        cssRules: [
          {
            selectorText: 'div',
            style: { 'max-width': '500px' },
          },
        ],
      }

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      })

      const div = document.createElement('div')
      const result = getStyleSheetCSSPropertyValue(div, 'max-width')

      expect(result).toEqual({
        source: 'stylesheet (https://example.com/main.css)',
        value: '500px',
      })

      cleanup()
    })

    test('falls back to computed style when no matching rules', () => {
      Object.defineProperty(document, 'styleSheets', {
        value: [],
        configurable: true,
      })

      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => '42px',
      })

      const div = document.createElement('div')
      const result = getStyleSheetCSSPropertyValue(div, 'min-width')

      expect(result).toEqual({
        source: 'cross-origin stylesheet',
        value: '42px',
      })

      cleanup()
    })

    test('catches cross-origin errors and falls back to computed style', () => {
      const mockStyleSheet = {
        href: 'https://unique-cross-origin.com/style.css',
        cssRules: null,
      }

      Object.defineProperty(mockStyleSheet, 'cssRules', {
        get() {
          throw new Error('SecurityError')
        },
      })

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      })

      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => '10px',
      })

      const div = document.createElement('div')
      const result = getStyleSheetCSSPropertyValue(div, 'min-height')

      expect(consoleMod.log).toHaveBeenCalledWith(
        'Unable to access stylesheet:',
        'https://unique-cross-origin.com/style.css',
      )
      expect(result).toEqual({
        source: 'cross-origin stylesheet',
        value: '10px',
      })

      cleanup()
    })

    test('skips rules that do not match the node', () => {
      const styleNode = document.createElement('style')

      const mockStyleSheet = {
        ownerNode: styleNode,
        href: null,
        cssRules: [
          {
            selectorText: '.no-match-class',
            style: { 'min-height': '999px' },
          },
        ],
      }

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      })

      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => '0px',
      })

      const div = document.createElement('div')
      const result = getStyleSheetCSSPropertyValue(div, 'min-height')

      expect(result).toEqual({
        source: 'cross-origin stylesheet',
        value: '0px',
      })

      cleanup()
    })

    test('skips rules without selectorText', () => {
      const styleNode = document.createElement('style')

      const mockStyleSheet = {
        ownerNode: styleNode,
        href: null,
        cssRules: [
          {
            selectorText: undefined,
            style: { 'min-height': '100px' },
          },
        ],
      }

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      })

      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => '',
      })

      const div = document.createElement('div')
      const result = getStyleSheetCSSPropertyValue(div, 'min-height')

      expect(result).toEqual({
        source: 'cross-origin stylesheet',
        value: '',
      })

      cleanup()
    })

    test('skips rules where the property value is empty', () => {
      const styleNode = document.createElement('style')

      const mockStyleSheet = {
        ownerNode: styleNode,
        href: null,
        cssRules: [
          {
            selectorText: 'div',
            style: { 'min-height': '' },
          },
        ],
      }

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      })

      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => 'auto',
      })

      const div = document.createElement('div')
      const result = getStyleSheetCSSPropertyValue(div, 'min-height')

      expect(result).toEqual({
        source: 'cross-origin stylesheet',
        value: 'auto',
      })

      cleanup()
    })
  })

  describe('getSetCSSPropertyValue', () => {
    test('returns inline style when present', () => {
      const div = document.createElement('div')
      div.style.minWidth = '150px'

      Object.defineProperty(document, 'styleSheets', {
        value: [],
        configurable: true,
      })

      const result = getSetCSSPropertyValue(div, 'minWidth')

      expect(result).toEqual({
        source: 'an inline style attribute',
        value: '150px',
      })
    })

    test('falls back to stylesheet value when no inline style', () => {
      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: () => '80px',
      })

      Object.defineProperty(document, 'styleSheets', {
        value: [],
        configurable: true,
      })

      const div = document.createElement('div')
      const result = getSetCSSPropertyValue(div, 'minWidth')

      expect(result).toEqual({
        source: 'cross-origin stylesheet',
        value: '80px',
      })

      window.getComputedStyle = originalGetComputedStyle
    })
  })
})
