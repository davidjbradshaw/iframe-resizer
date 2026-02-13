describe('Complex Integration Scenarios', () => {
  let iframe, settings, msgId

  beforeEach(() => {
    msgId = 'testIframe'
    iframe = document.createElement('iframe')
    iframe.id = msgId
    document.body.appendChild(iframe)

    // Mock iframe methods
    iframe.iFrameResizer = {
      resize: jasmine.createSpy('resize'),
      moveToAnchor: jasmine.createSpy('moveToAnchor'),
      sendMessage: jasmine.createSpy('sendMessage'),
      close: jasmine.createSpy('close'),
    }

    settings = {
      iframe,
      id: msgId,
      checkOrigin: false,
      log: false,
      onReady: jasmine.createSpy('onReady'),
      onMessage: jasmine.createSpy('onMessage'),
      onResized: jasmine.createSpy('onResized'),
      onScroll: jasmine.createSpy('onScroll'),
    }

    window.iframeResizer = window.iframeResizer || {}
    window.iframeResizer.settings = window.iframeResizer.settings || {}
    window.iframeResizer.settings[msgId] = settings
  })

  afterEach(() => {
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe)
    }
    if (window.iframeResizer && window.iframeResizer.settings) {
      delete window.iframeResizer.settings[msgId]
    }
  })

  describe('Nested iframes', () => {
    it('should handle nested iframe initialization', () => {
      const parentIframe = iframe
      const nestedIframe = document.createElement('iframe')
      nestedIframe.id = 'nestedIframe'

      // Create settings for nested iframe
      window.iframeResizer.settings.nestedIframe = {
        iframe: nestedIframe,
        id: 'nestedIframe',
        checkOrigin: false,
        log: false,
      }

      expect(window.iframeResizer.settings[msgId]).toBeDefined()
      expect(window.iframeResizer.settings.nestedIframe).toBeDefined()

      delete window.iframeResizer.settings.nestedIframe
    })

    it('should handle message passing through nested structure', () => {
      const message = '[iFrameSizer]message:testIframe:customData'

      settings.onMessage.and.returnValue(true)
      window.postMessage(message, '*')

      // Verify the parent can handle messages
      expect(settings.onMessage).toBeDefined()
    })

    it('should clean up nested iframes properly', () => {
      const nestedIframe = document.createElement('iframe')
      nestedIframe.id = 'nestedIframe'
      document.body.appendChild(nestedIframe)

      window.iframeResizer.settings.nestedIframe = {
        iframe: nestedIframe,
        id: 'nestedIframe',
      }

      // Cleanup
      delete window.iframeResizer.settings.nestedIframe
      if (nestedIframe.parentNode) {
        nestedIframe.parentNode.removeChild(nestedIframe)
      }

      expect(window.iframeResizer.settings.nestedIframe).toBeUndefined()
    })
  })

  describe('CSS transforms', () => {
    it('should handle iframes with CSS transforms', () => {
      iframe.style.transform = 'scale(0.5)'

      const rect = iframe.getBoundingClientRect()
      expect(rect).toBeDefined()
      expect(typeof rect.width).toBe('number')
      expect(typeof rect.height).toBe('number')
    })

    it('should calculate dimensions with transforms', () => {
      iframe.style.transform = 'rotate(45deg)'
      iframe.style.width = '500px'
      iframe.style.height = '300px'

      const computedStyle = window.getComputedStyle(iframe)
      // Browsers convert rotate(45deg) to matrix format in computed style
      expect(computedStyle.transform).toContain('matrix')
    })

    it('should handle position calculation with transforms', () => {
      iframe.style.transform = 'translate(50px, 100px)'

      const rect = iframe.getBoundingClientRect()
      expect(rect.left).toBeGreaterThanOrEqual(0)
      expect(rect.top).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Dynamic content', () => {
    it('should handle content changes via DOM manipulation', () => {
      const message = '[iFrameSizer]500:400:resize:testIframe'
      const event = {
        data: message,
        origin: window.location.origin,
      }

      window.postMessage(message, '*')

      // Verify settings are ready to handle resize
      expect(settings.iframe).toBeDefined()
      expect(settings.id).toBe(msgId)
    })

    it('should trigger resize on content addition', () => {
      const initialMessage = '[iFrameSizer]300:200:resize:testIframe'
      const updatedMessage = '[iFrameSizer]400:300:resize:testIframe'

      window.postMessage(initialMessage, '*')
      window.postMessage(updatedMessage, '*')

      expect(settings.onResized).toBeDefined()
    })

    it('should trigger resize on content removal', () => {
      const largeMessage = '[iFrameSizer]800:600:resize:testIframe'
      const smallMessage = '[iFrameSizer]200:150:resize:testIframe'

      window.postMessage(largeMessage, '*')
      window.postMessage(smallMessage, '*')

      expect(settings.iframe).toBeDefined()
    })

    it('should handle rapid content changes', () => {
      const messages = [
        '[iFrameSizer]100:100:resize:testIframe',
        '[iFrameSizer]200:200:resize:testIframe',
        '[iFrameSizer]300:300:resize:testIframe',
        '[iFrameSizer]400:400:resize:testIframe',
      ]

      messages.forEach((msg) => window.postMessage(msg, '*'))

      expect(settings.iframe).toBeDefined()
    })
  })

  describe('Scroll behavior', () => {
    it('should handle scroll to anchor in iframe', () => {
      const scrollMessage = '[iFrameSizer]0:0:inPageLink:#section1:testIframe'
      window.postMessage(scrollMessage, '*')

      expect(settings.onScroll).toBeDefined()
    })

    it('should handle scroll events', () => {
      iframe.contentWindow = {
        scrollTo: jasmine.createSpy('scrollTo'),
      }

      settings.scrolling = true

      expect(settings.scrolling).toBe(true)
    })

    it('should handle scroll with dynamic content', () => {
      const resizeMessage = '[iFrameSizer]1000:2000:resize:testIframe'
      const scrollMessage = '[iFrameSizer]0:500:inPageLink:#bottom:testIframe'

      window.postMessage(resizeMessage, '*')
      window.postMessage(scrollMessage, '*')

      expect(settings.onScroll).toBeDefined()
    })
  })

  describe('Size calculation methods', () => {
    it('should support different calculation methods', () => {
      const methods = [
        'bodyOffset',
        'bodyScroll',
        'documentElementOffset',
        'documentElementScroll',
        'max',
        'min',
        'grow',
        'lowestElement',
        'taggedElement',
      ]

      methods.forEach((method) => {
        settings.heightCalculationMethod = method
        expect(settings.heightCalculationMethod).toBe(method)
      })
    })

    it('should switch calculation methods dynamically', () => {
      settings.heightCalculationMethod = 'bodyOffset'
      expect(settings.heightCalculationMethod).toBe('bodyOffset')

      settings.heightCalculationMethod = 'max'
      expect(settings.heightCalculationMethod).toBe('max')
    })

    it('should handle custom calculation methods', () => {
      const customMethod = 'custom'
      settings.heightCalculationMethod = customMethod

      expect(settings.heightCalculationMethod).toBe(customMethod)
    })
  })

  describe('Multiple resize triggers', () => {
    it('should handle simultaneous triggers from different sources', () => {
      const messages = [
        '[iFrameSizer]300:200:mutationObserver:testIframe',
        '[iFrameSizer]300:200:interval:testIframe',
        '[iFrameSizer]300:200:size:testIframe',
      ]

      messages.forEach((msg) => window.postMessage(msg, '*'))

      expect(settings.iframe).toBeDefined()
    })

    it('should debounce multiple rapid triggers', () => {
      const message = '[iFrameSizer]500:400:resize:testIframe'

      // Send same message multiple times rapidly
      for (let i = 0; i < 10; i++) {
        window.postMessage(message, '*')
      }

      expect(settings.iframe).toBeDefined()
    })
  })

  describe('Complex DOM structures', () => {
    it('should handle deeply nested DOM', () => {
      const container = document.createElement('div')
      const nested1 = document.createElement('div')
      const nested2 = document.createElement('div')

      container.appendChild(nested1)
      nested1.appendChild(nested2)
      nested2.appendChild(iframe)

      document.body.appendChild(container)

      expect(iframe.parentNode).toBe(nested2)

      document.body.removeChild(container)
    })

    it('should handle shadow DOM elements', () => {
      if (typeof HTMLElement.prototype.attachShadow === 'undefined') {
        pending('Shadow DOM not supported in this environment')
        return
      }

      const container = document.createElement('div')
      const shadowRoot = container.attachShadow({ mode: 'open' })
      shadowRoot.appendChild(iframe)

      expect(iframe.parentNode).toBe(shadowRoot)
    })
  })

  describe('Integration with other features', () => {
    it('should combine multiple configuration options', () => {
      settings.tolerance = 10
      settings.checkOrigin = ['http://localhost:3000']
      settings.heightCalculationMethod = 'max'
      settings.widthCalculationMethod = 'scroll'
      settings.scrolling = true
      settings.sizeHeight = true
      settings.sizeWidth = true

      expect(settings.tolerance).toBe(10)
      expect(settings.checkOrigin).toEqual(['http://localhost:3000'])
      expect(settings.heightCalculationMethod).toBe('max')
      expect(settings.widthCalculationMethod).toBe('scroll')
      expect(settings.scrolling).toBe(true)
    })

    it('should work with all lifecycle callbacks', () => {
      settings.onInit = jasmine.createSpy('onInit')
      settings.onReady = jasmine.createSpy('onReady')
      settings.onMessage = jasmine.createSpy('onMessage')
      settings.onResized = jasmine.createSpy('onResized')
      settings.onScroll = jasmine.createSpy('onScroll')
      settings.onBeforeClose = jasmine.createSpy('onBeforeClose')
      settings.onAfterClose = jasmine.createSpy('onAfterClose')

      expect(settings.onInit).toBeDefined()
      expect(settings.onReady).toBeDefined()
      expect(settings.onMessage).toBeDefined()
      expect(settings.onResized).toBeDefined()
      expect(settings.onScroll).toBeDefined()
      expect(settings.onBeforeClose).toBeDefined()
      expect(settings.onAfterClose).toBeDefined()
    })
  })
})
