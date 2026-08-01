import { describe, expect, test, vi } from 'vitest'

import { id, invoke, isolateUserCode, once } from './functional'

describe('functional', () => {
  describe('once', () => {
    test('should call the function only once', () => {
      const mockFn = vi.fn()
      const wrappedFn = once(mockFn)

      wrappedFn()
      wrappedFn()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

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

  describe('id', () => {
    test('should return the input value', () => {
      expect(id(42)).toBe(42)
      expect(id('test')).toBe('test')
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

  describe('invoke', () => {
    test('should invoke the function', () => {
      const mockFn = vi.fn(() => 'result')
      const result = invoke(mockFn)
      expect(mockFn).toHaveBeenCalled()
      expect(result).toBe('result')
    })
  })
})
