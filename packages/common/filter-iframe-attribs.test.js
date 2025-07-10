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
      offset: 10,
      offsetHeight: 100,
      offsetWidth: 200,
      scrolling: 'auto',
      tolerance: 5,
      warningTimeout: 3000,
      waitForLoad: true,
      onAfterClose: jest.fn(),
      onReady: jest.fn(),
      onMessage: jest.fn(),
      onResized: jest.fn(),
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
