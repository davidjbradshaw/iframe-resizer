import formatAdvise from './format-advise'

describe('formatAdvise', () => {
  let mockFormatLogMsg

  beforeEach(() => {
    mockFormatLogMsg = jest.fn() // Mock the formatLogMsg function
  })

  test('should format the message with encoded styles in Chrome', () => {
    // Properly mock the Chrome environment
    Object.defineProperty(global, 'window', {
      value: { chrome: true },
      writable: true,
    })

    const msg = '<rb>Error:</> <b>Something went wrong</><br><i>Details</>'
    const formattedAdvise = formatAdvise(mockFormatLogMsg)
    formattedAdvise(msg)

    const expectedOutput =
      '\u001B[31;1mError:\u001B[m \u001B[1mSomething went wrong\u001B[m\n\u001B[3mDetails\u001B[m'

    expect(mockFormatLogMsg).toHaveBeenCalledWith(expectedOutput)
  })

  test('should remove formatting tags in non-Chrome environments', () => {
    // Simulate a non-Chrome environment
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    })

    const msg = '<rb>Error:</> <b>Something went wrong</><br><i>Details</></>'
    const formattedAdvise = formatAdvise(mockFormatLogMsg)
    formattedAdvise(msg)

    const expectedOutput = 'Error: Something went wrong\nDetails'

    expect(mockFormatLogMsg).toHaveBeenCalledWith(expectedOutput)
  })

  test('should handle empty messages gracefully', () => {
    const msg = ''
    const formattedAdvise = formatAdvise(mockFormatLogMsg)
    formattedAdvise(msg)

    expect(mockFormatLogMsg).toHaveBeenCalledWith('')
  })
})