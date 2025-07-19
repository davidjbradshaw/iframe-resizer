import { jest } from '@jest/globals'

import { advise } from './console'
import warnOnNoResponse from './timeout'

jest.mock('./console', () => ({
  advise: jest.fn(),
}))

describe('warnOnNoResponse', () => {
  let settings

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()

    // Mocking iframe.sandbox as a DOMTokenList-like object
    const mockSandbox = {
      contains: jest.fn((value) =>
        ['allow-scripts', 'allow-same-origin'].includes(value),
      ),
      length: 2, // Add a length property to simulate a valid sandbox
    }

    settings = {
      iframe1: {
        iframe: { sandbox: mockSandbox },
        waitForLoad: false,
        warningTimeout: 1000, // 1 second
        loaded: false,
        loadErrorShown: false,
      },
    }
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('should call advise with correct message when no sandbox issues', async () => {
    warnOnNoResponse('iframe1', settings)
    jest.runAllTimers() // Fast-forward all timers

    expect(advise).toHaveBeenCalledWith(
      'iframe1',
      expect.stringContaining('No response from iframe'), // Updated to match actual string
    )

    expect(advise).toHaveBeenCalledWith(
      'iframe1',
      expect.not.stringContaining('The iframe has the <b>sandbox</> attribute'),
    )
  })

  test('should include sandbox warning when sandbox is missing required attributes', async () => {
    // Update the mock to simulate missing 'allow-same-origin'
    settings.iframe1.iframe.sandbox.contains = jest.fn(
      (value) => value === 'allow-scripts',
    )

    warnOnNoResponse('iframe1', settings)
    jest.runAllTimers()

    const expectedMessage = `
      <rb>No response from iframe</> The iframe (<i>iframe1</>) has not responded within 1 seconds. Check <b>@iframe-resizer/child</> package has been loaded in the iframe.
      The iframe has the <b>sandbox</> attribute, please ensure it contains both the <i>'allow-same-origin'</> and <i>'allow-scripts'</> values.
      This message can be ignored if everything is working, or you can set the <b>warningTimeout</> option to a higher value or zero to suppress this warning.
    `
      .replace(/\s+/g, ' ')
      .trim()

    const receivedMessage = advise.mock.calls[0][1].replace(/\s+/g, ' ').trim()

    expect(receivedMessage).toBe(expectedMessage)
  })

  test('should include waitForLoad warning when waitForLoad is true', async () => {
    settings.iframe1.waitForLoad = true
    warnOnNoResponse('iframe1', settings)
    jest.runAllTimers()

    expect(advise).toHaveBeenCalledWith(
      'iframe1',
      expect.stringContaining(
        "The <b>waitForLoad</> option is currently set to <b>'true'</>.",
      ),
    )
  })

  test('should not include waitForLoad warning when waitForLoad is false', async () => {
    settings.iframe1.waitForLoad = false
    warnOnNoResponse('iframe1', settings)
    jest.runAllTimers()

    expect(advise).toHaveBeenCalledWith(
      'iframe1',
      expect.not.stringContaining(
        "The <b>waitForLoad</> option is currently set to <b>'true'</>.",
      ),
    )
  })

  test('should calculate warningTimeout correctly in the message', async () => {
    settings.iframe1.warningTimeout = 10_000 // 10 seconds
    warnOnNoResponse('iframe1', settings)
    jest.runAllTimers()

    expect(advise).toHaveBeenCalledWith(
      'iframe1',
      expect.stringContaining('has not responded within 10 seconds'),
    )
  })
})
