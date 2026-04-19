import { describe, expect, test, vi } from 'vitest'

vi.mock('@iframe-resizer/common/consts', async (importOriginal) => ({
  ...(await importOriginal()),
  VERSION: '1.2.3',
}))
vi.mock('../values/settings', () => ({ default: { version: '4.5.6' } }))

const getVersion = (await import('./get-version')).default
const settings = (await import('../values/settings')).default

describe('child/methods/get-version', () => {
  test('returns child and parent versions', () => {
    expect(getVersion()).toEqual({ child: '1.2.3', parent: '4.5.6' })
  })

  test('returns unknown when parent version is not set', () => {
    settings.version = undefined
    expect(getVersion()).toEqual({ child: '1.2.3', parent: 'unknown' })
  })
})
