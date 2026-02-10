import { describe, it, expect } from 'vitest'

import updateOptionNames from './update-option-names'
import settings from '../values/settings'

describe('core/setup/update-option-names', () => {
  it('renames deprecated option names and preserves values', () => {
    settings.id1 = { offset: 10, onClose: () => {}, onClosed: () => {}, console: { warn: () => {} } }
    updateOptionNames('id1')
    expect(settings.id1.offsetSize).toBe(10)
    expect(settings.id1.onBeforeClose).toBeDefined()
    expect(settings.id1.onAfterClose).toBeDefined()
    expect(settings.id1.offset).toBeUndefined()
    expect(settings.id1.onClose).toBeUndefined()
    expect(settings.id1.onClosed).toBeUndefined()
  })
})
