import { describe, expect, test } from 'vitest'

import { esModuleInterop, getElementName, hasOwn, lower, round } from './utils'

describe('utils', () => {
  describe('round', () => {
    test('should round numbers to three decimal places', () => {
      expect(round(3.141_59)).toBe(3.142)
      expect(round(2.718_28)).toBe(2.718)
    })
  })

  describe('lower', () => {
    test('should convert string to lowercase', () => {
      expect(lower('HELLO')).toBe('hello')
      expect(lower('World')).toBe('world')
      expect(lower('TeSt')).toBe('test')
    })
  })

  describe('getElementName', () => {
    test('should return the correct element name', () => {
      const mockElement = {
        nodeName: 'DIV',
        id: 'test-id',
        name: 'test-name',
        className: 'test-class',
      }

      expect(getElementName(mockElement)).toBe('DIV#test-id')

      delete mockElement.id

      expect(getElementName(mockElement)).toBe('DIV (test-name')

      delete mockElement.name

      expect(getElementName(mockElement)).toBe('DIV.test-class')

      delete mockElement.className

      expect(getElementName(mockElement)).toBe('DIV')
    })

    test('should return empty string for undefined element', () => {
      expect(getElementName()).toBe('')
      expect(getElementName('')).toBe('')
    })
  })

  describe('hasOwn', () => {
    test('should return true for own properties', () => {
      const obj = { foo: 'bar' }
      expect(hasOwn(obj, 'foo')).toBe(true)
    })

    test('should return false for inherited properties', () => {
      const obj = Object.create({ inherited: 'value' })
      expect(hasOwn(obj, 'inherited')).toBe(false)
    })

    test('should return false for non-existent properties', () => {
      const obj = {}
      expect(hasOwn(obj, 'missing')).toBe(false)
    })

    test('should use fallback when Object.hasOwn is falsy', () => {
      const original = Object.hasOwn

      try {
        Object.hasOwn = null

        const obj = { key: 'value' }
        expect(hasOwn(obj, 'key')).toBe(true)
        expect(hasOwn(obj, 'toString')).toBe(false)
      } finally {
        Object.hasOwn = original
      }
    })
  })

  describe('esModuleInterop', () => {
    test('should return the default export if __esModule is true', () => {
      const mockModule = { __esModule: true, default: 'default-export' }
      expect(esModuleInterop(mockModule)).toBe('default-export')
    })

    test('should return the module itself if __esModule is false', () => {
      const mockModule = { __esModule: false, default: 'default-export' }
      expect(esModuleInterop(mockModule)).toBe(mockModule)
    })

    test('should return null for null and undefined for undefined module', () => {
      expect(esModuleInterop(null)).toBe(null)
      expect(esModuleInterop()).toBe(undefined)
    })

    test('should return module without __esModule property', () => {
      const mockModule = { someProperty: 'value' }
      expect(esModuleInterop(mockModule)).toBe(mockModule)
    })

    test('should return module when __esModule is 0', () => {
      const mockModule = { __esModule: 0, default: 'default-export' }
      expect(esModuleInterop(mockModule)).toBe(mockModule)
    })

    test('should return module when __esModule is empty string', () => {
      const mockModule = { __esModule: '', default: 'default-export' }
      expect(esModuleInterop(mockModule)).toBe(mockModule)
    })
  })
})
