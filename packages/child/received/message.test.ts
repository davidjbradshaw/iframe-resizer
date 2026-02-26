import { beforeEach, describe, expect, test, vi } from 'vitest'

import settings from '../values/settings'

vi.mock('./utils', () => ({
  getData: () => '{"a":1}',
  parse: JSON.parse,
  parseFrozen: (s) => Object.freeze(JSON.parse(s)),
}))
vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../../common/utils', () => ({
  isolateUserCode: (fn, arg) => fn?.(arg),
}))

describe('child/received/message', () => {
  beforeEach(() => {
    settings.onMessage = vi.fn()
  })

  test('parses message body and calls user onMessage', async () => {
    const { default: message } = await import('./message')
    message({ data: '[iFrameSizer]:x' })

    expect(settings.onMessage).toHaveBeenCalledWith({ a: 1 })
  })
})
