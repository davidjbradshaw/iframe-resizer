/* eslint import/first: 0, simple-import-sort/imports: 0, import/named: 0 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { HEIGHT_EDGE, OVERFLOW_OBSERVER, WIDTH_EDGE } from '../../common/consts'

vi.mock('../values/state', () => {
  const state = { hasOverflow: false }
  return { default: state, __mockState: state }
})
vi.mock('../values/settings', () => {
  const settings = { calculateHeight: true }
  return { default: settings, __mockSettings: settings }
})
vi.mock('../check/overflow', () => {
  const check = { hasOverflowUpdated: true, overflowedNodeSet: new Set() }
  return { default: () => check, __mockCheck: check }
})
vi.mock('../console', () => ({ info: vi.fn() }))

let capturedOptions
let capturedCb
const attachObservers = vi.fn()
const disconnect = vi.fn()

vi.mock('../observers/overflow', () => ({
  default: (cb, options) => {
    capturedCb = cb
    capturedOptions = options
    return { attachObservers, disconnect }
  },
}))

vi.mock('../send/size', () => ({ default: vi.fn() }))

// Import after mocks
import createOverflowObservers from './overflow'
import * as childConsole from '../console'
import sendSize from '../send/size'
import { __mockState as mockState } from '../values/state'
import { __mockCheck as mockCheck } from '../check/overflow'
import { __mockSettings as mockSettings } from '../values/settings'

describe('child/observed/overflow branches', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    attachObservers.mockClear()
    disconnect.mockClear()
    sendSize.mockClear()
    childConsole.info.mockClear()
    mockState.hasOverflow = false
    mockCheck.hasOverflowUpdated = true
    mockCheck.overflowedNodeSet = new Set()
    capturedCb = undefined
    capturedOptions = undefined
  })

  it('creates observer with HEIGHT_EDGE when calculateHeight is true', () => {
    const observer = createOverflowObservers([document.body])
    expect(observer).toBeDefined()
    expect(attachObservers).toHaveBeenCalledTimes(1)
    expect(capturedOptions.side).toBe(HEIGHT_EDGE)
    expect(capturedOptions.root).toBe(document.documentElement)
  })

  it('creates observer with WIDTH_EDGE when calculateHeight is false', () => {
    mockSettings.calculateHeight = false

    createOverflowObservers([document.body])
    expect(capturedOptions.side).toBe(WIDTH_EDGE)
  })

  it('does nothing when hasOverflowUpdated is false', () => {
    createOverflowObservers([])
    mockCheck.hasOverflowUpdated = false
    capturedCb()
    expect(sendSize).not.toHaveBeenCalled()
    expect(childConsole.info).not.toHaveBeenCalled()
  })

  it('logs overflowed elements when set size > 1', () => {
    createOverflowObservers([])
    mockCheck.overflowedNodeSet = new Set([1, 2])
    capturedCb()
    expect(childConsole.info).toHaveBeenCalledWith(
      'Overflowed Elements:',
      mockCheck.overflowedNodeSet,
    )
    expect(sendSize).toHaveBeenCalledWith(OVERFLOW_OBSERVER, 'Overflow updated')
  })

  it('no info when hasOverflow=true and size <= 1', () => {
    createOverflowObservers([])
    mockState.hasOverflow = true
    mockCheck.overflowedNodeSet = new Set([1])
    capturedCb()
    expect(childConsole.info).not.toHaveBeenCalledWith('No overflow detected')
    expect(sendSize).toHaveBeenCalledWith(OVERFLOW_OBSERVER, 'Overflow updated')
  })

  it('logs "No overflow detected" on default branch', () => {
    createOverflowObservers([])
    mockState.hasOverflow = false
    mockCheck.overflowedNodeSet = new Set()
    capturedCb()
    expect(childConsole.info).toHaveBeenCalledWith('No overflow detected')
    expect(sendSize).toHaveBeenCalledWith(OVERFLOW_OBSERVER, 'Overflow updated')
  })
})
