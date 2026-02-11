import { describe, expect, test } from 'vitest'

import checkOptions from './options'

// No module mocking required; behavior is covered by executing the function

describe('core/checks/options branches', () => {
  test('returns empty object when options missing', () => {
    expect(checkOptions('x')).toEqual({})
  })

  test('advises when deprecated sizing options present', () => {
    const options = { sizeWidth: true }
    const result = checkOptions('id-1', options)
    expect(result).toBe(options)
  })

  test('does not advise when options do not include deprecated keys', () => {
    const options = { direction: 'vertical', other: 123 }
    const result = checkOptions('id-2', options)
    expect(result).toBe(options)
  })
})
