import { ElementRef, EventEmitter } from '@angular/core'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { IframeResizerDirective } from './directive'

// Stable mock handles for auto-console-group
const mockGroupLabel = vi.fn()
const mockGroupEvent = vi.fn()
const mockGroupWarn = vi.fn()
const mockGroupLog = vi.fn()

vi.mock('auto-console-group', () => ({
  default: () => ({
    label: mockGroupLabel,
    event: mockGroupEvent,
    warn: mockGroupWarn,
    expand: vi.fn(),
    log: mockGroupLog,
    endAutoGroup: vi.fn(),
  }),
}))

// Mock connectResizer to attach a minimal iframeResizer API and return a resizer
const disconnect = vi.fn()
const resize = vi.fn()
const moveToAnchor = vi.fn()
const sendMessage = vi.fn()

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => (iframe: any) => {
    // Expose a minimal API similar to production
    iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
    return iframe.iframeResizer
  }),
}))

describe('Angular IframeResizerDirective', () => {
  let directive: IframeResizerDirective
  let mockIframe: HTMLIFrameElement
  let mockElementRef: ElementRef

  beforeEach(async () => {
    // Clear mock calls
    disconnect.mockClear()
    resize.mockClear()
    moveToAnchor.mockClear()
    sendMessage.mockClear()
    mockGroupLabel.mockClear()
    mockGroupEvent.mockClear()
    mockGroupWarn.mockClear()
    mockGroupLog.mockClear()

    // Reset module state to get fresh mocks
    vi.resetModules()

    // Re-import to get mocked version
    const { IframeResizerDirective: FreshDirective } =
      await import('./directive')

    // Create mock iframe element
    mockIframe = document.createElement('iframe')
    mockIframe.id = 'test-iframe'
    document.body.append(mockIframe)

    // Create mock ElementRef
    mockElementRef = { nativeElement: mockIframe }

    // Create directive instance
    directive = new FreshDirective(mockElementRef)
  })

  test('directive has expected properties and methods', () => {
    expect(directive).toBeTruthy()
    expect(typeof directive.ngAfterViewInit).toBe('function')
    expect(typeof directive.ngOnDestroy).toBe('function')
    expect(typeof directive.resize).toBe('function')
    expect(typeof directive.moveToAnchor).toBe('function')
    expect(typeof directive.sendMessage).toBe('function')
  })

  test('directive has EventEmitter outputs', () => {
    expect(directive.onReady).toBeInstanceOf(EventEmitter)
    expect(directive.onMessage).toBeInstanceOf(EventEmitter)
    expect(directive.onResized).toBeInstanceOf(EventEmitter)
    expect(directive.onMouseEnter).toBeInstanceOf(EventEmitter)
    expect(directive.onMouseLeave).toBeInstanceOf(EventEmitter)
    expect(directive.onScroll).toBeInstanceOf(EventEmitter)
    expect(directive.onBeforeClose).toBeInstanceOf(EventEmitter)
  })

  test('ngAfterViewInit initializes iframe resizer', () => {
    directive.ngAfterViewInit()

    expect(mockIframe.iframeResizer).toBeDefined()
    expect(mockIframe.iframeResizer.disconnect).toBe(disconnect)
    expect(mockIframe.iframeResizer.resize).toBe(resize)
    expect(mockIframe.iframeResizer.moveToAnchor).toBe(moveToAnchor)
    expect(mockIframe.iframeResizer.sendMessage).toBe(sendMessage)
  })

  test('ngOnDestroy calls disconnect', () => {
    directive.ngAfterViewInit()
    directive.ngOnDestroy()

    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  test('resize method calls iframe resizer resize', () => {
    directive.ngAfterViewInit()
    directive.resize()

    expect(resize).toHaveBeenCalledTimes(1)
  })

  test('moveToAnchor method calls iframe resizer moveToAnchor', () => {
    directive.ngAfterViewInit()
    directive.moveToAnchor('section-1')

    expect(moveToAnchor).toHaveBeenCalledWith('section-1')
  })

  test('sendMessage method calls iframe resizer sendMessage', () => {
    directive.ngAfterViewInit()
    directive.sendMessage({ hello: 'world' }, '*')

    expect(sendMessage).toHaveBeenCalledWith({ hello: 'world' }, '*')
  })

  test('onReady callback emits EventEmitter', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    const nextSpy = vi.spyOn(directive.onReady, 'next')

    directive.ngAfterViewInit()

    const iframeElement = { id: 'test-iframe' }
    capturedOptions.onReady(iframeElement)

    expect(nextSpy).toHaveBeenCalledWith(iframeElement)
  })

  test('onMessage callback emits EventEmitter', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    const nextSpy = vi.spyOn(directive.onMessage, 'next')

    directive.ngAfterViewInit()

    const messageData = { iframe: { id: 'test' }, message: 'test message' }
    capturedOptions.onMessage(messageData)

    expect(nextSpy).toHaveBeenCalledWith(messageData)
  })

  test('onResized callback emits EventEmitter', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    const nextSpy = vi.spyOn(directive.onResized, 'next')

    directive.ngAfterViewInit()

    const resizeData = {
      iframe: { id: 'test' },
      width: 100,
      height: 200,
      type: 'init',
    }
    capturedOptions.onResized(resizeData)

    expect(nextSpy).toHaveBeenCalledWith(resizeData)
  })

  test('onMouseEnter callback emits EventEmitter', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    const nextSpy = vi.spyOn(directive.onMouseEnter, 'next')

    directive.ngAfterViewInit()

    const eventData = {
      iframe: { id: 'test' },
      width: 100,
      height: 200,
      type: 'mouseenter',
    }
    capturedOptions.onMouseEnter(eventData)

    expect(nextSpy).toHaveBeenCalledWith(eventData)
  })

  test('onMouseLeave callback emits EventEmitter', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    const nextSpy = vi.spyOn(directive.onMouseLeave, 'next')

    directive.ngAfterViewInit()

    const eventData = {
      iframe: { id: 'test' },
      width: 100,
      height: 200,
      type: 'mouseleave',
    }
    capturedOptions.onMouseLeave(eventData)

    expect(nextSpy).toHaveBeenCalledWith(eventData)
  })

  test('onScroll callback emits EventEmitter', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    const nextSpy = vi.spyOn(directive.onScroll, 'next')

    directive.ngAfterViewInit()

    const scrollData = { iframe: { id: 'test' }, top: 100, left: 0 }
    capturedOptions.onScroll(scrollData)

    expect(nextSpy).toHaveBeenCalledWith(scrollData)
  })

  test('onBeforeClose callback returns false and logs warning', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    directive.ngAfterViewInit()

    const result = capturedOptions.onBeforeClose('test-iframe')

    // The directive always returns false to prevent iframe removal
    expect(result).toBe(false)
    expect(mockGroupEvent).toHaveBeenCalledWith('close')
    expect(mockGroupWarn).toHaveBeenCalledWith(
      expect.stringContaining('Close event ignored'),
    )
  })

  test('options input is passed to connectResizer', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    directive.options = {
      license: 'TEST',
      checkOrigin: false,
      log: true,
      heightCalculationMethod: 'taggedElement',
    } as any

    directive.ngAfterViewInit()

    expect(capturedOptions.checkOrigin).toBe(false)
    expect(capturedOptions.log).toBe(true)
    expect(capturedOptions.heightCalculationMethod).toBe('taggedElement')
  })

  test('license option is passed to connectResizer', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    directive.options = { license: 'TEST-LICENSE-KEY' }
    directive.ngAfterViewInit()

    expect(capturedOptions.license).toBe('TEST-LICENSE-KEY')
  })

  test('debug mode logs in ngAfterViewInit and ngOnDestroy', () => {
    directive.debug = true
    directive.ngAfterViewInit()
    directive.ngOnDestroy()

    expect(mockGroupLog).toHaveBeenCalledWith('ngAfterViewInit')
    expect(mockGroupLog).toHaveBeenCalledWith('ngOnDestroy')
  })

  test('public methods handle undefined resizer gracefully', () => {
    // Call methods before ngAfterViewInit (when resizer is undefined)
    expect(() => directive.resize()).not.toThrow()
    expect(() => directive.moveToAnchor('test')).not.toThrow()
    expect(() => directive.sendMessage('test')).not.toThrow()

    // Verify the underlying methods were not called
    expect(resize).not.toHaveBeenCalled()
    expect(moveToAnchor).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  test('ngOnDestroy handles undefined resizer gracefully', () => {
    // Call ngOnDestroy before ngAfterViewInit (when resizer is undefined)
    expect(() => directive.ngOnDestroy()).not.toThrow()

    expect(disconnect).not.toHaveBeenCalled()
  })

  test('iframeResizer getter returns resizer object', () => {
    expect(directive.iframeResizer).toBeUndefined()

    directive.ngAfterViewInit()

    expect(directive.iframeResizer).toBeDefined()
    expect(directive.iframeResizer).toBe(mockIframe.iframeResizer)
  })

  test('onBeforeClose handles iframe without id', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default

    let capturedOptions: any
    connectResizer.mockImplementation((options: any) => {
      capturedOptions = options
      return (iframe: any) => {
        iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
        return iframe.iframeResizer
      }
    })

    // Create directive with iframe that has no id
    const iframeNoId = document.createElement('iframe')
    const elementRefNoId = { nativeElement: iframeNoId }
    const { IframeResizerDirective: FreshDirective } =
      await import('./directive')
    const directiveNoId = new FreshDirective(elementRefNoId)

    directiveNoId.ngAfterViewInit()

    const result = capturedOptions.onBeforeClose('some-id')

    expect(result).toBe(false)
    expect(mockGroupLabel).toHaveBeenCalledWith('angular()')
    expect(mockGroupWarn).toHaveBeenCalledWith(
      expect.stringContaining('Close event ignored'),
    )
  })
})
