import { describe, expect, it } from 'vitest'

import isAllowedOrigin from './allowed-origin'

describe('core/checks/allowed-origin', () => {
  it('matches an entry by its origin', () => {
    const list = ['https://a.example/', 'https://b.example/page.html']

    expect(isAllowedOrigin(list, 'https://a.example')).toBe(true)
    expect(isAllowedOrigin(list, 'https://b.example')).toBe(true)
    expect(isAllowedOrigin(list, 'https://c.example')).toBe(false)
  })

  it('allows any origin for *', () => {
    expect(isAllowedOrigin(['*'], 'https://c.example')).toBe(true)
  })

  it('does not match an entry that is not a URL', () => {
    expect(isAllowedOrigin(['not a url'], 'https://c.example')).toBe(false)
  })
})
