define(['iframeResizerParent'], (iframeResize) => {
  describe('Info message payloads', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    async function bind(id) {
      iframe = document.getElementsByTagName('iframe')[0]
      iframe.id = id
      iframeResize({ license: 'GPLv3', id, checkOrigin: false })
      mockMsgFromIFrame(iframe, 'init')
      await iframeLoaded(iframe)
      await delay(50)
    }

    describe('pageInfo', () => {
      it('sends every field the child reads', async () => {
        await bind('info1')
        const postMessage = await spyOnIframeMessages(iframe)

        mockMsgFromIFrame(iframe, 'pageInfo')
        await delay(50)

        const info = lastJsonMsg(postMessage, 'pageInfo')

        expect(info).withContext('no pageInfo was sent').toBeDefined()
        expect(Object.keys(info).sort()).toEqual([
          'clientHeight',
          'clientWidth',
          'documentHeight',
          'documentWidth',
          'iframeHeight',
          'iframeWidth',
          'offsetLeft',
          'offsetTop',
          'scrollLeft',
          'scrollTop',
          'windowHeight',
          'windowWidth',
        ])

        mockMsgFromIFrame(iframe, 'pageInfoStop')
      })

      it('measures the iframe and the page, not placeholders', async () => {
        await bind('info2')
        const postMessage = await spyOnIframeMessages(iframe)

        mockMsgFromIFrame(iframe, 'pageInfo')
        await delay(50)

        const info = lastJsonMsg(postMessage, 'pageInfo')
        const rect = iframe.getBoundingClientRect()
        const body = document.body.getBoundingClientRect()

        expect(info.iframeHeight).toBe(rect.height)
        expect(info.iframeWidth).toBe(rect.width)
        expect(info.offsetTop).toBe(Math.trunc(rect.top - body.top))
        expect(info.offsetLeft).toBe(Math.trunc(rect.left - body.left))
        expect(info.scrollTop).toBe(window.scrollY)
        expect(info.scrollLeft).toBe(window.scrollX)
        expect(info.windowHeight).toBe(window.innerHeight)
        expect(info.windowWidth).toBe(window.innerWidth)
        expect(info.iframeWidth).toBeGreaterThan(0)

        mockMsgFromIFrame(iframe, 'pageInfoStop')
      })
    })

    describe('parentInfo', () => {
      it('sends the iframe rect, the document and the viewport', async () => {
        await bind('info3')
        const postMessage = await spyOnIframeMessages(iframe)

        mockMsgFromIFrame(iframe, 'parentInfo')
        await delay(50)

        const info = lastJsonMsg(postMessage, 'parentInfo')

        expect(info).withContext('no parentInfo was sent').toBeDefined()
        expect(Object.keys(info).sort()).toEqual([
          'document',
          'iframe',
          'viewport',
        ])

        expect(Object.keys(info.viewport).sort()).toEqual([
          'height',
          'offsetLeft',
          'offsetTop',
          'pageLeft',
          'pageTop',
          'scale',
          'width',
        ])

        const rect = iframe.getBoundingClientRect()

        expect(info.iframe.width).toBe(rect.width)
        expect(info.iframe.height).toBe(rect.height)
        expect(info.iframe.top).toBe(rect.top)
        expect(info.iframe.left).toBe(rect.left)
        expect(info.document.scrollWidth).toBe(
          document.documentElement.scrollWidth,
        )

        expect(info.document.scrollHeight).toBe(
          document.documentElement.scrollHeight,
        )

        expect(info.viewport.scale).toBe(window.visualViewport.scale)
        expect(info.viewport.width).toBe(window.visualViewport.width)

        mockMsgFromIFrame(iframe, 'parentInfoStop')
      })
    })

    // The monitor sends from scroll, resize and two ResizeObservers, never
    // from a timer, so an idle wait cannot tell a stopped monitor from a
    // running one — the stop has to be checked against a real event
    describe('stopping a monitor', () => {
      it('stops sending parentInfo after parentInfoStop', async () => {
        await bind('info4')

        mockMsgFromIFrame(iframe, 'parentInfo')
        await delay(50)

        const postMessage = await spyOnIframeMessages(iframe)

        window.dispatchEvent(new Event('resize'))
        await delay(50)

        expect(countJsonMsgs(postMessage, 'parentInfo'))
          .withContext('the monitor was not running to begin with')
          .toBeGreaterThan(0)

        mockMsgFromIFrame(iframe, 'parentInfoStop')
        await delay(50)
        postMessage.calls.reset()

        window.dispatchEvent(new Event('resize'))
        await delay(50)

        expect(countJsonMsgs(postMessage, 'parentInfo')).toBe(0)
      })

      it('stops sending pageInfo after pageInfoStop', async () => {
        await bind('info5')

        mockMsgFromIFrame(iframe, 'pageInfo')
        await delay(50)

        const postMessage = await spyOnIframeMessages(iframe)

        window.dispatchEvent(new Event('resize'))
        await delay(50)

        expect(countJsonMsgs(postMessage, 'pageInfo'))
          .withContext('the monitor was not running to begin with')
          .toBeGreaterThan(0)

        mockMsgFromIFrame(iframe, 'pageInfoStop')
        await delay(50)
        postMessage.calls.reset()

        window.dispatchEvent(new Event('resize'))
        await delay(50)

        expect(countJsonMsgs(postMessage, 'pageInfo')).toBe(0)
      })
    })
  })
})
