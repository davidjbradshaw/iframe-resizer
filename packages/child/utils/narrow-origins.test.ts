import { describe, expect, test } from 'vitest'

import narrowOrigins from './narrow-origins'

const LIST = ['https://a.com', 'https://b.com']

describe('child/utils/narrow-origins', () => {
  test('narrows a list to the known origin', () => {
    expect(narrowOrigins(LIST, 'https://b.com')).toEqual(['https://b.com'])
  })

  test('keeps the list when the origin is unknown or not in it', () => {
    expect(narrowOrigins(LIST)).toEqual(LIST)
    expect(narrowOrigins(LIST, 'https://c.com')).toEqual(LIST)
  })

  test('wraps a single origin', () => {
    expect(narrowOrigins('*', 'https://b.com')).toEqual(['*'])
  })
})
