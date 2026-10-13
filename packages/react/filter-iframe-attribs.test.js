import { AUTO } from '@iframe-resizer/common/consts'

import filterIframeAttribs from './filter-iframe-attribs'

describe('filterIframeAttribs', () => {
  test('should filter out specific iframe-related properties', () => {
    const props = {
      license: 'some-license',
      bodyBackground: '#fff',
      bodyMargin: '10px',
      bodyPadding: '5px',
      checkOrigin: true,
      direction: 'vertical',
      inPageLinks: true,
      log: true,
      logExpand: false,
      offsetSize: 10,
      scrolling: AUTO,
      tolerance: 5,
      waitForLoad: true,
      warningTimeout: 3000,
      onAfterClose: vi.fn(),
      onMessage: vi.fn(),
      onMouseEnter: vi.fn(),
      onMouseLeave: vi.fn(),
      onReady: vi.fn(),
      onResized: vi.fn(),
      onScroll: vi.fn(),
      customProp1: 'value1',
      customProp2: 'value2',
    }

    const result = filterIframeAttribs(props)

    expect(result).toEqual({
      customProp1: 'value1',
      customProp2: 'value2',
    })
  })

  test('should return an empty object if no additional properties are provided', () => {
    const props = {
      license: 'some-license',
      bodyBackground: '#fff',
      bodyMargin: '10px',
    }

    const result = filterIframeAttribs(props)

    expect(result).toEqual({})
  })
})
