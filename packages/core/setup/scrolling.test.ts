import { afterEach, describe, expect, it } from 'vitest'

import settings from '../values/settings'
import setScrolling from './scrolling'

describe('core/setup/scrolling', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    for (const k of Object.keys(settings)) delete settings[k]
  })

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
    expect(iframe.style.overflow).toBe('auto')
  })

  it('uses custom scrolling string value in default case', () => {
    const iframe = document.createElement('iframe')
    iframe.id = 'custom-scroll'
    document.body.append(iframe)

    settings['custom-scroll'] = { scrolling: 'auto' }
    setScrolling(iframe)

    expect(iframe.scrolling).toBe('auto')
  })

  it('defaults to "no" when scrolling is undefined', () => {
    const iframe = document.createElement('iframe')
    iframe.id = 'undefined-scroll'
    document.body.append(iframe)

    settings['undefined-scroll'] = { scrolling: undefined }
    setScrolling(iframe)

    expect(iframe.scrolling).toBe('no')
  })
})
