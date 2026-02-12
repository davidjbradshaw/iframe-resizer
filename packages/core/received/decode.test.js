import { beforeEach, describe, expect, test, vi } from 'vitest'

import { MESSAGE_ID_LENGTH } from '../../common/consts'
import settings from '../values/settings'
import decodeMessage, { getBorderEnds, getPaddingEnds } from './decode'

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

  test('returns 0 for padding/border when boxSizing is not border-box', () => {
    global.getComputedStyle = () => ({
      boxSizing: 'content-box',
      paddingTop: '5px',
      paddingBottom: '3px',
      borderTopWidth: '2px',
      borderBottomWidth: '1px',
    })

    const comp = global.getComputedStyle()
    expect(getPaddingEnds(comp)).toBe(0)
    expect(getBorderEnds(comp)).toBe(0)
  })

  test('handles missing padding values', () => {
    global.getComputedStyle = () => ({
      boxSizing: 'border-box',
      paddingTop: null,
      paddingBottom: null,
    })

    const comp = global.getComputedStyle()
    expect(getPaddingEnds(comp)).toBe(0)
  })

  test('handles missing border values', () => {
    global.getComputedStyle = () => ({
      boxSizing: 'border-box',
      borderTopWidth: null,
      borderBottomWidth: null,
    })

    const comp = global.getComputedStyle()
    expect(getBorderEnds(comp)).toBe(0)
  })

  test('decodes message without mode field', () => {
    global.getComputedStyle = () => ({
      boxSizing: 'content-box',
    })

    const body = 'i1:100:200:TYPE:MSG'
    const msg = 'X'.repeat(MESSAGE_ID_LENGTH) + body

    const data = decodeMessage(msg)

    expect(data.id).toBe('i1')
    expect(data.height).toBe(100)
    expect(data.width).toBe(200)
    expect(data.mode).toBeUndefined()
  })

  test('handles missing height value', () => {
    global.getComputedStyle = () => ({
      boxSizing: 'content-box',
    })

    const body = 'i1::200:TYPE:MSG'
    const msg = 'X'.repeat(MESSAGE_ID_LENGTH) + body

    const data = decodeMessage(msg)

    expect(data.id).toBe('i1')
    expect(data.height).toBe(0)
    expect(data.width).toBe(200)
  })

  afterEach(() => {
    global.getComputedStyle = origGetComputed
    delete settings.i1
  })
})
