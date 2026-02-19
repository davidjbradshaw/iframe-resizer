import { vi } from 'vitest'

import createIframeResize from './factory'

// Mock the core module (CJS/ESM default export)
vi.mock('@iframe-resizer/core', () => ({ default: vi.fn(() => vi.fn()) }))

describe('createIframeResize - Disconnected iframes', () => {
  let iFrameResize
  let mockIframe

  beforeEach(() => {
    // Reset the module and create a fresh instance
    vi.clearAllMocks()
    iFrameResize = createIframeResize()

    // Create a mock iframe element
    mockIframe = document.createElement('iframe')
    mockIframe.id = 'test-iframe'
    mockIframe.src = 'https://example.com'
  })

  afterEach(() => {
    // Clean up any DOM elements
    document.body.innerHTML = ''
  })

  it('should immediately initialize a connected iframe', () => {
    // Add iframe to DOM first
    document.body.append(mockIframe)

    // Initialize
    const result = iFrameResize({}, mockIframe)

    // Should return the iframe in the array
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(mockIframe)
  })

  it('should defer initialization for a disconnected iframe', () => {
    // Don't add iframe to DOM - it's disconnected
    expect(mockIframe.isConnected).toBe(false)

    // Initialize - should not throw
    const result = iFrameResize({}, mockIframe)

    // Should still return the iframe in the array
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(mockIframe)
  })

  it('should initialize a disconnected iframe once it is added to DOM', async () => {
    // Create a disconnected iframe
    expect(mockIframe.isConnected).toBe(false)

    // Initialize the disconnected iframe
    iFrameResize({}, mockIframe)

    // Add a small delay to ensure MutationObserver is set up
    await new Promise((resolve) => {
      setTimeout(resolve, 10)
    })

    // Now add it to the DOM
    document.body.append(mockIframe)

    // Give MutationObserver time to fire
    await new Promise((resolve) => {
      setTimeout(resolve, 50)
    })

    // Verify iframe is now connected
    expect(mockIframe.isConnected).toBe(true)
  })

  it('should handle multiple disconnected iframes', () => {
    const iframe1 = document.createElement('iframe')
    iframe1.id = 'iframe-1'

    const iframe2 = document.createElement('iframe')
    iframe2.id = 'iframe-2'

    // Initialize first disconnected iframe
    const result1 = iFrameResize({}, iframe1)

    // Initialize second disconnected iframe
    const result2 = iFrameResize({}, iframe2)

    // Each should be in their respective results
    expect(result1).toHaveLength(1)
    expect(result2).toHaveLength(1)
  })

  it('should throw error for non-iframe elements', () => {
    const div = document.createElement('div')

    expect(() => {
      iFrameResize({}, div)
    }).toThrow('Expected <IFRAME> tag, found <DIV>')
  })

  it('should throw error for null element', () => {
    expect(() => {
      iFrameResize({}, null)
    }).toThrow('iframe is not defined')
  })

  it('should throw error for element without tagName', () => {
    const invalidElement = {}

    expect(() => {
      iFrameResize({}, invalidElement)
    }).toThrow('Not a valid DOM element')
  })

  it('should query and initialize all iframes when no target is specified', () => {
    // Add two iframes to the DOM
    const iframe1 = document.createElement('iframe')
    iframe1.id = 'iframe-1'
    document.body.append(iframe1)

    const iframe2 = document.createElement('iframe')
    iframe2.id = 'iframe-2'
    document.body.append(iframe2)

    // Initialize all iframes
    const result = iFrameResize({})

    // Should return both iframes
    expect(result).toHaveLength(2)
  })

  it('should query and initialize iframes matching a CSS selector', () => {
    // Add two iframes, one with a specific class
    const iframe1 = document.createElement('iframe')
    iframe1.id = 'iframe-1'
    iframe1.className = 'resizable'
    document.body.append(iframe1)

    const iframe2 = document.createElement('iframe')
    iframe2.id = 'iframe-2'
    document.body.append(iframe2)

    // Initialize only iframes with the 'resizable' class
    const result = iFrameResize({}, '.resizable')

    // Should return only the matching iframe
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(iframe1)
  })

  it('should not run in server-side rendering environment', () => {
    // Save original window
    const originalWindow = global.window

    // Delete window to simulate SSR
    delete global.window

    const ssrIFrameResize = createIframeResize()
    const result = ssrIFrameResize({}, mockIframe)

    // Should return empty array
    expect(result).toEqual([])

    // Restore window
    global.window = originalWindow
  })

  it('should throw error when document.body is null in browser environment', () => {
    // Save original document.body
    const originalBody = document.body

    // Temporarily remove document.body to simulate early initialization
    Object.defineProperty(document, 'body', {
      configurable: true,
      get: () => null,
    })

    // Should throw an error since we're in browser environment (window exists)
    expect(() => {
      iFrameResize({}, mockIframe)
    }).toThrow('document.body is not available')

    // Restore document.body
    Object.defineProperty(document, 'body', {
      configurable: true,
      get: () => originalBody,
    })
  })

  it('should throw error for unexpected data type', () => {
    expect(() => {
      iFrameResize({}, 123)
    }).toThrow('Unexpected data type (number)')

    expect(() => {
      iFrameResize({}, true)
    }).toThrow('Unexpected data type (boolean)')
  })
})
