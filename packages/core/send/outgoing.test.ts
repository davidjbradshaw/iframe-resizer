import { describe, expect, test, vi } from 'vitest'

vi.mock('../values/page', () => ({ default: { version: '5' } }))
vi.mock('../values/settings', () => ({
  default: {
    abc: {
      autoResize: true,
      bodyBackground: 'url(https://cdn.example/bg.png)',
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
      maxContentWidth: true,
    },
    ':r1:': {
      bodyBackground: '#fff',
      bodyMargin: 8,
      bodyPadding: '0',
      mode: 0,
      sizeHeight: true,
      sizeWidth: false,
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
    // A colon in a body style is escaped, so it does not shift the fields
    expect(parts[9]).toBe('url(https%3A//cdn.example/bg.png)') // bodyBackground
    expect(parts[10]).toBe('0') // bodyPadding
    expect(parts[11]).toBe('0') // tolerance
    expect(parts[12]).toBe('true') // inPageLinks
    expect(parts[14]).toBe('scroll') // widthCalculationMethod
    expect(parts[23]).toBe('false') // logExpand
    expect(parts[24]).toBe('true') // maxContentWidth, the last field
    expect(parts).toHaveLength(25)
  })

  test('takes overrides in place of the settings, for this message only', () => {
    const parts = createOutgoingMessage('abc', { autoResize: false }).split(':')

    expect(parts[6]).toBe('false') // autoResize
    expect(createOutgoingMessage('abc').split(':')[6]).toBe('true')
  })

  test('escapes the colons in the iframe id', () => {
    const parts = createOutgoingMessage(':r1:').split(':')

    expect(parts[0]).toBe('%3Ar1%3A')
    expect(parts[7]).toBe('8') // bodyMargin, still in its field
    expect(parts).toHaveLength(25)
  })
})
