import { NUMBER, STRING } from './consts'
import {
  capitalizeFirstLetter,
  esModuleInterop,
  getElementName,
  hasOwn,
  id,
  invoke,
  isDarkModeEnabled,
  isDef,
  isElement,
  isIframe,
  isNumber,
  isObject,
  isolateUserCode,
  isSafari,
  isString,
  lower,
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
      expect(isNumber('42')).toBe(false)
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
      // Save original
      const original = Object.hasOwn

      try {
        // Make Object.hasOwn falsy
        Object.hasOwn = null

        const obj = { key: 'value' }
        expect(hasOwn(obj, 'key')).toBe(true)
        expect(hasOwn(obj, 'toString')).toBe(false)
      } finally {
        // Restore
        Object.hasOwn = original
      }
    })
  })

  describe('isElement', () => {
    test('should return true for element nodes', () => {
      const element = document.createElement('div')
      expect(isElement(element)).toBe(true)
    })

    test('should return false for non-element nodes', () => {
      const textNode = document.createTextNode('text')
      expect(isElement(textNode)).toBe(false)
    })
  })

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

  describe('isSafari', () => {
    test('should be a boolean', () => {
      expect(typeof isSafari).toBe('boolean')
    })
  })

  describe('isolateUserCode', () => {
    test('should execute function asynchronously', () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      isolateUserCode(mockFn, 'arg1', 'arg2')

      expect(mockFn).not.toHaveBeenCalled()
      vi.runAllTimers()
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
      vi.useRealTimers()
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

  describe('invoke', () => {
    test('should invoke the function', () => {
      const mockFn = vi.fn(() => 'result')
      const result = invoke(mockFn)
      expect(mockFn).toHaveBeenCalled()
      expect(result).toBe('result')
    })
  })

  describe('lower', () => {
    test('should convert string to lowercase', () => {
      expect(lower('HELLO')).toBe('hello')
      expect(lower('World')).toBe('world')
      expect(lower('TeSt')).toBe('test')
    })
  })

  describe('esModuleInterop - edge cases', () => {
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

  describe('once - edge cases', () => {
    test('should preserve function context', () => {
      const context = { value: 42 }
      const mockFn = vi.fn(function () {
        return this.value
      })
      const wrappedFn = once(mockFn)

      const result = wrappedFn.call(context)
      expect(result).toBe(42)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('should pass arguments correctly', () => {
      const mockFn = vi.fn((a, b) => a + b)
      const wrappedFn = once(mockFn)

      const result = wrappedFn(5, 3)
      expect(result).toBe(8)
      expect(mockFn).toHaveBeenCalledWith(5, 3)
    })
  })

  describe('isDarkModeEnabled - edge cases', () => {
    test('should return undefined when matchMedia is undefined', () => {
      const originalMatchMedia = window.matchMedia
      window.matchMedia = undefined

      expect(isDarkModeEnabled()).toBe(undefined)

      window.matchMedia = originalMatchMedia
    })
  })

  describe('isIframe - edge cases', () => {
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
})
