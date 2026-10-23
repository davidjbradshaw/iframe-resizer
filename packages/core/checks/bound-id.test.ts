import { afterEach, describe, expect, test } from 'vitest'

import settings from '../values/settings'
import checkBoundId from './bound-id'

describe('core/checks/bound-id', () => {
  afterEach(() => {
    for (const key of Object.keys(settings)) delete settings[key]
  })

  test('passes an iframe that keeps the id it was bound with', () => {
    const iframe = { id: 'bound' } as HTMLIFrameElement
    settings.bound = { iframe }

    expect(() => checkBoundId(iframe)).not.toThrow()
  })

  test('throws a ReferenceError naming both ids once the id has changed', () => {
    const iframe = { id: 'bound' } as HTMLIFrameElement
    settings.bound = { iframe }
    iframe.id = 'renamed'

    expect(() => checkBoundId(iframe)).toThrow(ReferenceError)
    expect(() => checkBoundId(iframe)).toThrow('from "bound" to "renamed"')
  })
})
