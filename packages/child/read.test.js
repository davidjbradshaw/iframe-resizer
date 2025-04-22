import { readBoolean, readFunction, readNumber, readString } from './read'

describe('read utility functions', () => {
  const mockData = {
    funcKey: () => {},
    boolKey: true,
    numKey: 42,
    strKey: 'test',
  }

  test('readFunction should return the function if the key exists and is a function', () => {
    expect(readFunction(mockData, 'funcKey')).toBe(mockData.funcKey)
  })

  test('readFunction should throw a TypeError if the key is not a function', () => {
    expect(() => readFunction(mockData, 'boolKey')).toThrow(TypeError)
  })

  test('readBoolean should return the boolean if the key exists and is a boolean', () => {
    expect(readBoolean(mockData, 'boolKey')).toBe(true)
  })

  test('readBoolean should throw a TypeError if the key is not a boolean', () => {
    expect(() => readBoolean(mockData, 'numKey')).toThrow(TypeError)
  })

  test('readNumber should return the number if the key exists and is a number', () => {
    expect(readNumber(mockData, 'numKey')).toBe(42)
  })

  test('readNumber should throw a TypeError if the key is not a number', () => {
    expect(() => readNumber(mockData, 'strKey')).toThrow(TypeError)
  })

  test('readString should return the string if the key exists and is a string', () => {
    expect(readString(mockData, 'strKey')).toBe('test')
  })

  test('readString should throw a TypeError if the key is not a string', () => {
    expect(() => readString(mockData, 'funcKey')).toThrow(TypeError)
  })

  test('read functions should return undefined if the key does not exist', () => {
    expect(readFunction(mockData, 'missingKey')).toBeUndefined()
    expect(readBoolean(mockData, 'missingKey')).toBeUndefined()
    expect(readNumber(mockData, 'missingKey')).toBeUndefined()
    expect(readString(mockData, 'missingKey')).toBeUndefined()
  })
})
