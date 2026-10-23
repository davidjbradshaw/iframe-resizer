define(['iframeResizerParent'], (iframeResize) => {
  describe('Origin validation', () => {
    let iframe

    // The fixture iframe is served from this page's own origin, so with
    // checkOrigin left on that is the only origin the parent accepts
    const OTHER_ORIGIN = 'https://not-the-iframe.example'
    const RESIZE = '100:200:mutationObserver'

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    function bind(id, options) {
      iframe = document.getElementsByTagName('iframe')[0]
      iframe.id = id

      iframeResize({ license: 'GPLv3', ...options })

      return iframe
    }

    it('sends to the iframe origin, not *, when checkOrigin is on', (done) => {
      bind('origin1')

      const postMessage = spyOn(iframe.contentWindow, 'postMessage')
      window.postMessage('[iframeResizerChild]Ready', '*')

      setTimeout(() => {
        expect(initMsgFields(postMessage))
          .withContext('no init message was sent')
          .toBeDefined()

        expect(postMessage.calls.first().args[1]).toBe(getTarget(iframe))
        expect(postMessage.calls.first().args[1]).not.toBe('*')
        setTimeout(done, 1)
      }, 50)
    })

    it('rejects a resize from an origin outside checkOrigin', async () => {
      bind('origin2')
      mockMsgFromIFrame(iframe, 'init')
      await delay(50)

      const before = iframe.style.height

      // The rejection throws out of the message listener, which dispatchEvent
      // reports as an uncaught error rather than passing back to the caller
      await jasmine.spyOnGlobalErrorsAsync(async (globalErrors) => {
        mockMsgFromOrigin(iframe, OTHER_ORIGIN, RESIZE)
        await delay(50)

        expect(globalErrors).toHaveBeenCalled()
      })

      expect(iframe.style.height).toBe(before)
    })

    it('accepts a resize from an origin in the checkOrigin list', async () => {
      bind('origin3', { checkOrigin: [window.location.origin] })
      mockMsgFromIFrame(iframe, 'init')
      await delay(50)

      mockMsgFromOrigin(iframe, window.location.origin, RESIZE)
      await delay(100)

      expect(iframe.style.height).toBe('100px')
    })

    it('rejects a resize from an origin not in the checkOrigin list', async () => {
      bind('origin4', { checkOrigin: ['https://allowed.example'] })
      const before = iframe.style.height

      await jasmine.spyOnGlobalErrorsAsync(async (globalErrors) => {
        mockMsgFromOrigin(iframe, OTHER_ORIGIN, RESIZE)
        await delay(50)

        expect(globalErrors).toHaveBeenCalled()
      })

      expect(iframe.style.height).toBe(before)
    })

    // Checked before the origin, so it holds even with checkOrigin off: a
    // page's own scripts must not be able to drive the resizer
    it('ignores a message that is not from the iframe window', async () => {
      bind('origin5', { checkOrigin: false })
      mockMsgFromIFrame(iframe, 'init')
      await delay(50)

      const before = iframe.style.height

      mockMsgFromOrigin(iframe, window.location.origin, RESIZE, null)
      await delay(50)

      expect(iframe.style.height).toBe(before)
    })
  })
})
