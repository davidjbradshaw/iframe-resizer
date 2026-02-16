import { describe, expect, test, vi } from 'vitest'

vi.mock('../values/page', () => ({ default: { version: '5' } }))
vi.mock('../values/settings', () => ({
  default: {
    abc: {
      autoResize: true,
      bodyBackground: '#fff',
      bodyMargin: 8,
      bodyPadding: '0',
      heightCalculationMethod: 'auto',
      inPageLinks: true,
      license: 'MIT',
      log: true,
      logExpand: false,
      mouseEvents: true,
      offsetHeight: 1,
      offsetWidth: 2,
      mode: 0,
      sizeHeight: true,
      sizeWidth: false,
      tolerance: 0,
      widthCalculationMethod: 'scroll',
    },
  },
}))

const createOutgoingMessage = (await import('./outgoing')).default

describe('core/send/outgoing', () => {
  test('creates expected outgoing message string', () => {
    const msg = createOutgoingMessage('abc')
    const parts = msg.split(':')

    expect(typeof msg).toBe('string')
    expect(parts.length).toBeGreaterThan(10)
    expect(parts[0]).toBe('abc')
    // Verify key field positions match expected settings values
    expect(parts[2]).toBe('false') // sizeWidth
    expect(parts[3]).toBe('true') // log
    expect(parts[6]).toBe('true') // autoResize
    expect(parts[7]).toBe('8') // bodyMargin
    expect(parts[8]).toBe('auto') // heightCalculationMethod
    expect(parts[11]).toBe('0') // tolerance
    expect(parts[12]).toBe('true') // inPageLinks
    expect(parts[14]).toBe('scroll') // widthCalculationMethod
  })
})
