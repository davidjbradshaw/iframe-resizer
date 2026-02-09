import { describe, test, expect, vi, beforeEach } from 'vitest'

import settings from '../values/settings'
import { getPaddingEnds, getBorderEnds, default as decodeMessage } from './decode'
import { MESSAGE_ID_LENGTH } from '../../common/consts'

describe('core/received/decode', () => {
  const origGetComputed = global.getComputedStyle

  beforeEach(() => {
    vi.clearAllMocks()
    settings.i1 = { iframe: document.createElement('iframe') }
    global.getComputedStyle = () => ({
      boxSizing: 'border-box',
      paddingTop: '5px',
      paddingBottom: '3px',
      borderTopWidth: '2px',
      borderBottomWidth: '1px',
    })
  })

  test('calculates padding and border ends', () => {
    const comp = global.getComputedStyle()
    expect(getPaddingEnds(comp)).toBe(8)
    expect(getBorderEnds(comp)).toBe(3)
  })

  test('decodes a message string into messageData', () => {
    const body = 'i1:100:200:TYPE:MSG:MODE'
    const msg = 'X'.repeat(MESSAGE_ID_LENGTH) + body

    const data = decodeMessage(msg)

    expect(data.id).toBe('i1')
    expect(data.height).toBe(100 + 8 + 3)
    expect(data.width).toBe(200)
    expect(data.type).toBe('TYPE')
    expect(data.message).toBe('MSG')
    expect(data.mode).toBe('MODE')
  })

  afterEach(() => {
    global.getComputedStyle = origGetComputed
    delete settings.i1
  })
})
