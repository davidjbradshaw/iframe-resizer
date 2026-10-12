import { afterEach, describe, expect, it } from 'vitest'

import getBoundId from './bound-id'
import settings from './settings'

describe('core/values/bound-id', () => {
  afterEach(() => {
    for (const key of Object.keys(settings)) delete settings[key]
  })

  it('returns the id the iframe was bound under after its id changes', () => {
    const iframe = document.createElement('iframe')
    settings.first = { iframe }
    iframe.id = 'renamed'

    expect(getBoundId(iframe)).toBe('first')
  })

  it('returns the id attribute of an iframe that is not bound', () => {
    const iframe = document.createElement('iframe')
    iframe.id = 'loose'

    expect(getBoundId(iframe)).toBe('loose')
  })
})
