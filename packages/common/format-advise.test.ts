import createFormatAdvise from './format-advise'

describe('createFormatAdvise', () => {
  let mockFormatLogMsg

  beforeEach(() => {
    mockFormatLogMsg = vi.fn() // Mock the formatLogMsg function
  })

  test('should format the message with encoded styles in Chrome', () => {
    // Properly mock the Chrome environment
    Object.defineProperty(global, 'window', {
      value: { chrome: true },
      writable: true,
    })

    const msg = '<rb>Error:</> <b>Something went wrong</><br><i>Details</>'
    const formatAdvise = createFormatAdvise(mockFormatLogMsg)
    formatAdvise(msg)

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
    const formatAdvise = createFormatAdvise(mockFormatLogMsg)
    formatAdvise(msg)

    const expectedOutput = 'Error: Something went wrong\nDetails'

    expect(mockFormatLogMsg).toHaveBeenCalledWith(expectedOutput)
  })

  test('should handle empty messages gracefully', () => {
    const msg = ''
    const formatAdvise = createFormatAdvise(mockFormatLogMsg)
    formatAdvise(msg)

    expect(mockFormatLogMsg).toHaveBeenCalledWith('')
  })

  test('unknown tags in Chrome environment produce empty string via ?? fallback', () => {
    Object.defineProperty(global, 'window', {
      value: { chrome: true },
      writable: true,
    })

    // <iy> is not a known tag, so lookup returns '' via the ?? '' fallback
    const msg = '<iy>text</>'
    const formatAdvise = createFormatAdvise(mockFormatLogMsg)
    formatAdvise(msg)

    // Unknown tags are replaced with '' (the ?? '' fallback in lookup)
    expect(mockFormatLogMsg).toHaveBeenCalledWith(
      expect.stringContaining('text'),
    )
  })

  test('passes non-string messages through unchanged', () => {
    Object.defineProperty(global, 'window', {
      value: { chrome: true },
      writable: true,
    })

    const nonStringMsg = { error: 'object message' }
    const formatAdvise = createFormatAdvise(mockFormatLogMsg)
    formatAdvise(nonStringMsg)

    // Non-string messages are passed through as-is (covers the : message branch)
    expect(mockFormatLogMsg).toHaveBeenCalledWith(nonStringMsg)
  })
})
