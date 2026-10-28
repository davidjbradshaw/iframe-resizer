define(['iframeResizerParent'], (iframeResize) => {
  describe('Parent API', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    function bind(id, options) {
      iframe = document.getElementsByTagName('iframe')[0]
      iframe.id = id
      iframeResize({ license: 'GPLv3', id, checkOrigin: false, ...options })
      return iframe
    }

    describe('getVersion()', () => {
      it('reports the parent version that went into the init message', async () => {
        bind('api1')

        await iframeLoaded(iframe)
        const postMessage = spyOn(iframe.contentWindow, 'postMessage')
        await delay(50)

        const fields = initMsgFields(postMessage)

        expect(iframe.iframeResizer.getVersion().parent).toBe(fields[20])
        expect(iframe.iframeResizer.getVersion().parent).toMatch(/^\d+\./)
      })

      // A v1-v5 child sends no version field, and the parent has to keep
      // working with it
      it('reports a child that sends no version as legacy', async () => {
        bind('api2')

        expect(iframe.iframeResizer.getVersion().child).toBe('legacy')

        mockMsgFromIFrame(iframe, 'init')
        await delay(50)

        expect(iframe.iframeResizer.getVersion().child).toBe('legacy')
      })

      it('reports the version a v6 child sends', async () => {
        bind('api3')
        mockPostMsg('api3', '0:0:init:6.0.0')
        await delay(50)

        expect(iframe.iframeResizer.getVersion().child).toBe('6.0.0')
      })
    })

    describe('disconnect()', () => {
      it('takes the methods off the iframe and stops resizing it', async () => {
        bind('api4')
        mockMsgFromIFrame(iframe, 'init')
        await delay(50)

        iframe.iframeResizer.disconnect()
        const before = iframe.style.height

        expect(iframe.iframeResizer).not.toBeDefined()

        mockPostMsg('api4', '100:200:mutationObserver')
        await delay(50)

        expect(iframe.style.height).toBe(before)
      })

      // Whether disconnect() stops the monitor itself or the monitor stops
      // itself on its next event is not visible from here; that no further
      // info reaches a disconnected iframe is
      it('sends no more parent info once disconnected', async () => {
        bind('api5')
        mockMsgFromIFrame(iframe, 'init')
        await delay(50)

        mockMsgFromIFrame(iframe, 'parentInfo')
        await delay(50)

        await iframeLoaded(iframe)
        const postMessage = spyOn(iframe.contentWindow, 'postMessage')

        iframe.iframeResizer.disconnect()
        window.dispatchEvent(new Event('resize'))
        window.dispatchEvent(new Event('scroll'))
        await delay(50)

        expect(countJsonMsgs(postMessage, 'parentInfo')).toBe(0)
      })

      // An iframe removed without disconnect() first is disconnected by the
      // observer, which has to release it under the id it was bound with and
      // not whatever the element is called by then
      it('releases a renamed element that was removed from the page', async () => {
        bind('api6')
        mockMsgFromIFrame(iframe, 'init')
        await delay(50)

        iframe.id = 'api6-renamed'
        iframe.remove()
        await delay(50)

        expect(iframe.iframeResizer).not.toBeDefined()

        const before = iframe.style.height
        mockPostMsg('api6', '100:200:mutationObserver')
        await delay(50)

        expect(iframe.style.height).toBe(before)
      })
    })

    describe('sendMessage()', () => {
      beforeEach(async () => {
        bind('api7')
        mockMsgFromIFrame(iframe, 'init')
        await delay(50)
      })

      it('sends a value JSON can encode', async () => {
        await iframeLoaded(iframe)
        const postMessage = spyOn(iframe.contentWindow, 'postMessage')

        iframe.iframeResizer.sendMessage({ a: 1 })

        expect(postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]message:{"a":1}',
          '*',
        )
      })

      // These encode to nothing, which the child cannot parse, so the caller
      // is told rather than the message going missing
      it('throws on a value JSON cannot encode', () => {
        const { sendMessage } = iframe.iframeResizer

        expect(() => sendMessage()).toThrowError(
          TypeError,
          /must be a value JSON can encode, not undefined/,
        )

        expect(() => sendMessage(() => {})).toThrowError(
          TypeError,
          /must be a value JSON can encode, not function/,
        )

        expect(() => sendMessage(Symbol('x'))).toThrowError(
          TypeError,
          /must be a value JSON can encode, not symbol/,
        )
      })

      it('throws on a targetOrigin that is not a string', () => {
        const { sendMessage } = iframe.iframeResizer

        expect(() => sendMessage('ok', 1)).toThrowError(
          TypeError,
          /targetOrigin is not a String/,
        )
      })
    })
  })
})
