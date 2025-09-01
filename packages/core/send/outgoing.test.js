// Mock dependencies before importing the module under test
import page from '../values/page'
import settings from '../values/settings'
import buildOutgoing from './outgoing'

jest.mock('../values/settings', () => ({
  __esModule: true,
  default: {},
}))

jest.mock('../values/page', () => ({
  __esModule: true,
  default: { version: '9.9.9' },
}))

describe('core/outgoing', () => {
  beforeEach(() => {
    for (const k of Object.keys(settings)) delete settings[k]
    jest.clearAllMocks()
    // default mock page.version (can be overridden per test)
    page.version = '9.9.9'
  })

  test('builds a colon-delimited payload in the correct order', () => {
    const id = 'id123'
    settings[id] = {
      sizeWidth: true,
      log: false,
      autoResize: true,
      bodyMargin: 8,
      heightCalculationMethod: 'max',
      bodyBackground: '#fff',
      bodyPadding: '10px',
      tolerance: 6,
      inPageLinks: false,
      widthCalculationMethod: 'scroll',
      mouseEvents: true,
      offsetHeight: 123,
      offsetWidth: 456,
      sizeHeight: true,
      license: 'MIT',
      mode: 2,
      logExpand: false,
    }

    const result = buildOutgoing(id)

    const expectedParts = [
      id, // 0 iframeId
      '8', // 1 Back-compat (PaddingV1)
      true, // 2 sizeWidth
      false, // 3 log
      '32', // 4 Back-compat (Interval)
      true, // 5 Back-compat (EnablePublicMethods)
      true, // 6 autoResize
      8, // 7 bodyMargin
      'max', // 8 heightCalculationMethod
      '#fff', // 9 bodyBackground
      '10px', // 10 bodyPadding
      6, // 11 tolerance
      false, // 12 inPageLinks
      'child', // 13 Back-compat (resizeFrom)
      'scroll', // 14 widthCalculationMethod
      true, // 15 mouseEvents
      123, // 16 offsetHeight
      456, // 17 offsetWidth
      true, // 18 sizeHeight
      'MIT', // 19 license
      '9.9.9', // 20 page.version
      2, // 21 mode
      '', // 22 sizeSelector (empty)
      false, // 23 logExpand
    ]

    expect(result).toBe(expectedParts.join(':'))

    // Also assert a few key indices explicitly
    const parts = result.split(':')

    expect(parts[0]).toBe(id)
    expect(parts[1]).toBe('8')
    expect(parts[4]).toBe('32')
    expect(parts[13]).toBe('child')
    expect(parts[20]).toBe('9.9.9')
    expect(parts[22]).toBe('') // empty sizeSelector
  })

  test('handles undefined fields by emitting empty segments', () => {
    const id = 'id-empty'
    settings[id] = {
      sizeWidth: false,
      log: true,
      autoResize: false,
      bodyMargin: 0,
      heightCalculationMethod: 'bodyScroll',
      bodyBackground: undefined, // intentionally undefined
      bodyPadding: undefined, // intentionally undefined
      tolerance: 0,
      inPageLinks: true,
      widthCalculationMethod: 'max',
      mouseEvents: false,
      offsetHeight: 0,
      offsetWidth: 0,
      sizeHeight: false,
      license: undefined, // intentionally undefined
      mode: 0,
      logExpand: true,
    }
    page.version = '1.2.3'

    const result = buildOutgoing(id)
    const parts = result.split(':')

    // bodyBackground (index 9) and bodyPadding (index 10) become ''
    expect(parts[9]).toBe('')
    expect(parts[10]).toBe('')
    // license (index 19) becomes ''
    expect(parts[19]).toBe('')
    // version and other known indices still correct
    expect(parts[20]).toBe('1.2.3')
    expect(parts[22]).toBe('') // sizeSelector remains empty
  })
})
