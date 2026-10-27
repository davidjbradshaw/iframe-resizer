import {
  COLLAPSE,
  EXPAND,
  LOG_COLLAPSED,
  LOG_DISABLED,
  LOG_EXPANDED,
} from '@iframe-resizer/common/consts'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import normalizeLog from './normalize-log'

describe('core/setup/normalize-log', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('leaves options without a log option untouched', () => {
    const options = { id: 'x' }
    normalizeLog(options)

    expect(options).toEqual({ id: 'x' })
  })

  test('maps LOG_DISABLED to false', () => {
    const options: Record<string, any> = { log: LOG_DISABLED }
    normalizeLog(options)

    expect(options).toEqual({ log: false })
  })

  test('maps LOG_COLLAPSED to collapsed logging', () => {
    const options: Record<string, any> = { log: LOG_COLLAPSED }
    normalizeLog(options)

    expect(options).toEqual({ log: true, logExpand: false })
  })

  test('maps LOG_EXPANDED to expanded logging', () => {
    const options: Record<string, any> = { log: LOG_EXPANDED }
    normalizeLog(options)

    expect(options).toEqual({ log: true, logExpand: true })
  })

  test('derives logExpand from a string log option', () => {
    const options: Record<string, any> = { log: EXPAND }
    normalizeLog(options)

    expect(options).toEqual({ log: true, logExpand: true })
  })

  test('keeps an explicit logExpand over the one implied by the string', () => {
    const options: Record<string, any> = { log: COLLAPSE, logExpand: true }
    normalizeLog(options)

    expect(options).toEqual({ log: true, logExpand: true })
  })

  test('leaves a boolean log option as it is', () => {
    const options: Record<string, any> = { log: true }
    normalizeLog(options)

    expect(options).toEqual({ log: true })
  })
})
