import { describe, expect, it } from 'vitest'

import { VERSION } from '../../common/consts'
import page from './page'

describe('core/values/page', () => {
  it('exposes default position and the version', () => {
    expect(page.position).toBeNull()
    expect(page.version).toBe(VERSION)
  })
})
