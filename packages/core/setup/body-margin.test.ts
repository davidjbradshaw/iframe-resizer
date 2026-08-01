/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../values/settings', () => ({
  default: {
    x: { bodyMargin: 5 },
  },
}))

import setupBodyMargin from './body-margin'
import settings from '../values/settings'

describe('core/setup/body-margin', () => {
  beforeEach(() => {
    settings.x.bodyMargin = 5
  })

  it('converts numeric margin to px string', () => {
    setupBodyMargin('x')
    expect(settings.x.bodyMargin).toBe('5px')
  })

  it('leaves non-numeric non-zero values unchanged', () => {
    settings.x.bodyMargin = '10px'
    setupBodyMargin('x')
    expect(settings.x.bodyMargin).toBe('10px')
  })

  it('converts "0" to "0px"', () => {
    settings.x.bodyMargin = '0'
    setupBodyMargin('x')
    expect(settings.x.bodyMargin).toBe('0px')
  })

  it('converts numeric 0 to "0px"', () => {
    settings.x.bodyMargin = 0
    setupBodyMargin('x')
    expect(settings.x.bodyMargin).toBe('0px')
  })
})
