import { NUMBER, STRING } from './consts'
import {
  capitalizeFirstLetter,
  esModuleInterop,
  getElementName,
  id,
  isDarkModeEnabled,
  isIframe,
  isNumber,
  once,
  round,
  typeAssert,
} from './utils'

describe('utils.js', () => {
  describe('isNumber', () => {
    test('should return true for valid numbers', () => {
      expect(isNumber(42)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
    })

    test('should return false for invalid numbers', () => {
      expect(isNumber(NaN)).toBe(false)
      expect(isNumber('42')).toBe(true)
    })
  })

  describe('once', () => {
    test('should call the function only once', () => {
      const mockFn = vi.fn()
      const wrappedFn = once(mockFn)

      wrappedFn()
      wrappedFn()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('isDarkModeEnabled', () => {
    test('should return true if dark mode is enabled', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
      }))

      expect(isDarkModeEnabled()).toBe(true)
    })

    test('should return false if dark mode is not enabled', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
      }))

      expect(isDarkModeEnabled()).toBe(false)
    })
  })

  describe('id', () => {
    test('should return the input value', () => {
      expect(id(42)).toBe(42)
      expect(id('test')).toBe('test')
    })
  })

  describe('round', () => {
    test('should round numbers to three decimal places', () => {
      expect(round(3.141_59)).toBe(3.142)
      expect(round(2.718_28)).toBe(2.718)
    })
  })

  describe('capitalizeFirstLetter', () => {
    test('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello')
      expect(capitalizeFirstLetter('world')).toBe('World')
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
