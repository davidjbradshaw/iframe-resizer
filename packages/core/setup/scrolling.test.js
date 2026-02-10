import { describe, expect, it } from 'vitest'

import settings from '../values/settings'
import setScrolling from './scrolling'

describe('core/setup/scrolling', () => {
  it('sets overflow and scrolling attribute based on settings', () => {
    const iframe = document.createElement('iframe')
    iframe.id = 'a'
    document.body.append(iframe)

    settings.a = { scrolling: true }
    setScrolling(iframe)

    expect(iframe.style.overflow).toBe('auto')
    expect(iframe.scrolling).toBe('yes')

    settings.a = { scrolling: false }
    setScrolling(iframe)

    expect(iframe.style.overflow).toBe('hidden')
    expect(iframe.scrolling).toBe('no')

    settings.a = { scrolling: 'omit' }
    setScrolling(iframe)

    expect(iframe.scrolling).toBe('no')
  })
})
