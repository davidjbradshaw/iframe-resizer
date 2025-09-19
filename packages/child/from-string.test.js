import { FALSE } from '../common/consts'
import { getBoolean, getNumber } from './from-string'

describe('from-string utility functions', () => {
  describe('getBoolean', () => {
    test('should return true for the string "true"', () => {
      expect(getBoolean('true')).toBe(true)
    })

    test('should return false for the string "false"', () => {
      expect(getBoolean(FALSE)).toBe(false)
    })

    test('should return undefined for undefined input', () => {
      expect(getBoolean()).toBeUndefined()
    })

    test('should return false for non-boolean strings', () => {
      expect(getBoolean('random')).toBe(false)
    })
  })

  describe('getNumber', () => {
    test('should return a number for valid numeric strings', () => {
      expect(getNumber('42')).toBe(42)
      expect(getNumber('3.14')).toBe(3.14)
    })

    test('should return NaN for non-numeric strings', () => {
      expect(getNumber('random')).toBeNaN()
    })

    test('should return undefined for undefined input', () => {
      expect(getNumber()).toBeUndefined()
    })
  })
})
