import { afterEach, describe, expect, it } from 'vitest'

import settings from '../values/settings'
import updateOptionNames from './update-option-names'

describe('core/setup/update-option-names', () => {
  afterEach(() => {
    for (const key of Object.keys(settings)) delete settings[key]
  })

  it('renames deprecated option names and preserves values', () => {
    settings.id1 = {
      offset: 10,
      onClose: () => {},
      onClosed: () => {},
      console: { warn: () => {} },
    }
    updateOptionNames('id1')

    expect(settings.id1.offsetSize).toBe(10)
    expect(settings.id1.onBeforeClose).toBeDefined()
    expect(settings.id1.onAfterClose).toBeDefined()
    expect(settings.id1.offset).toBeUndefined()
    expect(settings.id1.onClose).toBeUndefined()
    expect(settings.id1.onClosed).toBeUndefined()
  })

  it('does not rename when deprecated options are not present', () => {
    settings.id2 = {
      offsetSize: 20, // Already using new name
      console: { warn: () => {} },
    }
    updateOptionNames('id2')

    expect(settings.id2.offsetSize).toBe(20)
    expect(settings.id2.offset).toBeUndefined()
  })
})
