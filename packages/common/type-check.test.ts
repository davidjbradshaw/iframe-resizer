import { describe, expect, test } from 'vitest'

import { NUMBER, STRING } from './consts'
import { isDef, isIframe, isObject, isString, typeAssert } from './type-check'

describe('type-check', () => {
  describe('isObject', () => {
    test('should return true for objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ key: 'value' })).toBe(true)
      expect(isObject([])).toBe(true)
    })

    test('should return false for non-objects', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject('string')).toBe(false)
      expect(isObject(42)).toBe(false)
      expect(isObject()).toBe(false)
    })
  })

  describe('isString', () => {
    test('should return true for strings', () => {
      expect(isString('test')).toBe(true)
      expect(isString('')).toBe(true)
    })

    test('should return false for non-strings', () => {
      expect(isString(42)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString()).toBe(false)
      expect(isString({})).toBe(false)
    })
  })

  describe('isIframe', () => {
    test('should return true for iframe elements', () => {
      const mockIframe = document.createElement('iframe')
      expect(isIframe(mockIframe)).toBe(true)
    })

    test('should return false for non-iframe elements', () => {
      const mockDiv = document.createElement('div')
      expect(isIframe(mockDiv)).toBe(false)
    })

    test('should return false for non-objects', () => {
      expect(isIframe(null)).toBe(false)
      expect(isIframe('string')).toBe(false)
      expect(isIframe(42)).toBe(false)
    })

    test('should handle errors gracefully', () => {
      const mockObj = {
        get tagName() {
          throw new Error('Access denied')
        },
      }
      expect(isIframe(mockObj)).toBe(false)
    })

    test('should return true for HTMLIFrameElement instance when tagName is not IFRAME', () => {
      const mockIframe = document.createElement('iframe')
      Object.defineProperty(mockIframe, 'tagName', {
        get() {
          return 'DIV'
        },
        configurable: true,
      })
      expect(isIframe(mockIframe)).toBe(true)
    })
  })

  describe('isDef', () => {
    test('should return true for defined values', () => {
      expect(isDef('test')).toBe(true)
      expect(isDef(42)).toBe(true)
      expect(isDef(0)).toBe(true)
      expect(isDef(false)).toBe(true)
      expect(isDef(null)).toBe(true)
    })

    test('should return false for undefined or empty string', () => {
      expect(isDef()).toBe(false)
      expect(isDef('')).toBe(false)
    })
  })

  describe('typeAssert', () => {
    test('should not throw an error for valid types', () => {
      expect(() => typeAssert(42, NUMBER, 'Value')).not.toThrow()
      expect(() => typeAssert('test', STRING, 'Value')).not.toThrow()
    })

    test('should throw a TypeError for invalid types', () => {
      expect(() => typeAssert(42, STRING, 'Value')).toThrow(
        'Value is not a String',
      )

      expect(() => typeAssert('test', NUMBER, 'Value')).toThrow(
        'Value is not a Number',
      )
    })
  })
})
