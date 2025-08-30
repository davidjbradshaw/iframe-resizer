// Mock modules without referencing out-of-scope variables
import { isolateUserCode } from '../common/utils'
import checkEvent from './checkEvent'
import { warn } from './console'
import settings from './values/settings'

jest.mock('./values/settings', () => ({
  __esModule: true,
  default: {},
}))

jest.mock('../common/utils', () => ({
  __esModule: true,
  isolateUserCode: jest.fn(),
}))

jest.mock('./console', () => ({
  __esModule: true,
  warn: jest.fn(),
}))

beforeEach(() => {
  // reset settings object and mocks
  for (const k of Object.keys(settings)) delete settings[k]
  jest.clearAllMocks()
})

test('returns null when iframeId settings are missing', () => {
  expect(checkEvent('nope', 'onLoad', 123)).toBeNull()
})

test('calls isolateUserCode for non-special handlers', () => {
  const iframeId = 'ifr1'
  const fn = jest.fn()
  settings[iframeId] = { onLoad: fn }

  const val = { a: 1 }
  checkEvent(iframeId, 'onLoad', val)

  expect(isolateUserCode).toHaveBeenCalledTimes(1)
  expect(isolateUserCode).toHaveBeenCalledWith(fn, val)
  expect(fn).not.toHaveBeenCalled() // wrapped execution is delegated to isolateUserCode
})

test('onBeforeClose: executes handler directly and returns its value', () => {
  const iframeId = 'ifr2'
  const handler = jest.fn().mockReturnValue('ok')
  settings[iframeId] = { onBeforeClose: handler }

  const val = { reason: 'test' }
  const ret = checkEvent(iframeId, 'onBeforeClose', val)

  expect(handler).toHaveBeenCalledWith(val)
  expect(isolateUserCode).not.toHaveBeenCalled()
  expect(ret).toBe('ok')
})

test('onScroll: executes handler directly', () => {
  const iframeId = 'ifr3'
  const handler = jest.fn()
  settings[iframeId] = { onScroll: handler }

  const val = { x: 1, y: 2 }
  const ret = checkEvent(iframeId, 'onScroll', val)

  expect(handler).toHaveBeenCalledWith(val)
  expect(isolateUserCode).not.toHaveBeenCalled()
  expect(ret).toBeUndefined()
})

test('onBeforeClose: errors are caught, console.error and warn are called', () => {
  const iframeId = 'ifr4'
  const error = new Error('boom')
  const handler = jest.fn(() => {
    throw error
  })
  settings[iframeId] = { onBeforeClose: handler }

  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {})

  const ret = checkEvent(iframeId, 'onBeforeClose', { foo: 'bar' })

  expect(consoleErrorSpy).toHaveBeenCalledWith(error)
  expect(warn).toHaveBeenCalledWith(iframeId, 'Error in onBeforeClose callback')
  expect(ret).toBeNull()

  consoleErrorSpy.mockRestore()
})

test('throws TypeError when handler is not a function', () => {
  const iframeId = 'ifr5'
  settings[iframeId] = { onResize: 'not-a-function' }

  expect(() => checkEvent(iframeId, 'onResize', {})).toThrow(
    new TypeError('onResize on iframe[ifr5] is not a function'),
  )
})
