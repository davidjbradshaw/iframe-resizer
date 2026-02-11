import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

it('parseFrozen returns an immutable object', async () => {
  const { parseFrozen } = await import('./utils')
  const obj = parseFrozen('{"a":1}')
  expect(Object.isFrozen(obj)).toBe(true)
  expect(obj.a).toBe(1)
})

it('notExpected calls sendMessage with typeStop', async () => {
  vi.mock('../send/message', () => ({ default: vi.fn() }))
  const { notExpected } = await import('./utils')
  const msg = await import('../send/message')
  notExpected('foo')
  expect(msg.default).toHaveBeenCalledWith(0, 0, 'fooStop')
})

it('getData extracts payload after separator', async () => {
  const { getData } = await import('./utils')
  const data = '[iFrameSizer]type:payload:rest'
  expect(getData({ data })).toBe('payload:rest')
})

it('getMessageType returns INIT for init messages, else extracted type', async () => {
  const { getMessageType } = await import('./utils')
  expect(getMessageType({ data: '[iFrameSizer]resize:payload:true' })).toBe(
    'init',
  )

  const { getMessageType: getMsgType2 } = await import('./utils')
  expect(getMsgType2({ data: '[iFrameSizer]resize:payload' })).toBe('resize')
})
