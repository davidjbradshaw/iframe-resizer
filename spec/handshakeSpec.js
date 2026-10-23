define(['iframeResizerParent'], (iframeResize) => {
  describe('Real child handshake', () => {
    let iframe

    const CONTENT_HEIGHT = 345

    beforeEach(() => {
      loadIFrame('iframeRealChild.html')
      iframe = document.getElementById('realChild')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    // Every other spec here fakes the child's init with mockMsgFromIFrame.
    // These run @iframe-resizer/child for real in the iframe, so the init
    // string the parent builds has to be one the child can actually parse.
    function connect(options) {
      return new Promise((resolve) => {
        iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          ...options,
          onReady: (iframeEl) => resolve(iframeEl),
        })
      })
    }

    it('completes a handshake and sizes the iframe to the content', async () => {
      await connect()
      await waitFor(() => iframe.style.height === `${CONTENT_HEIGHT}px`)

      expect(iframe.style.height).toBe(`${CONTENT_HEIGHT}px`)
    })

    // A mismatch here means the parent and child were built apart, which is
    // what the build number in a test build exists to catch
    it('reports the child version, not the legacy fallback', async () => {
      await connect()

      const { child, parent } = iframe.iframeResizer.getVersion()

      expect(child).not.toBe('legacy')
      expect(child).toBe(parent)
    })

    it('resizes again when the content grows', async () => {
      await connect()

      iframe.iframeResizer.sendMessage('grow')
      await waitFor(() => iframe.style.height === '500px')

      expect(iframe.style.height).toBe('500px')
    })

    it('sizes the width only when asked to', async () => {
      await connect({ direction: 'both' })

      iframe.iframeResizer.sendMessage('widen')
      await waitFor(() => iframe.style.width === '400px')

      expect(iframe.style.width).toBe('400px')
    })

    // The one path that cannot be reached without a real child: the script
    // arrives after the load event, so the parent's init went to a page that
    // could not answer. The child's ready message has to restart it.
    describe('a child that loads late', () => {
      const LATE_HEIGHT = 275

      beforeEach(() => {
        loadIFrame('iframeLateLoad.html')
        iframe = document.getElementById('lateChild')
      })

      it('completes the handshake once the child script arrives', async () => {
        await connect()
        await waitFor(() => iframe.style.height === `${LATE_HEIGHT}px`)

        expect(iframe.style.height).toBe(`${LATE_HEIGHT}px`)
        expect(iframe.iframeResizer.getVersion().child).not.toBe('legacy')
      })
    })

    describe('parentIframe methods', () => {
      it('sends a message back to the parent', async () => {
        const messages = []

        await connect({
          onMessage: ({ message }) => messages.push(message),
        })

        iframe.iframeResizer.sendMessage('sendId')
        await waitFor(() => messages.length > 0)

        expect(messages).toEqual(['realChild'])
      })

      it('closes the iframe when the child asks', async () => {
        let closed = false

        await connect({
          onAfterClose: () => {
            closed = true
          },
        })

        iframe.iframeResizer.sendMessage('close')
        await waitFor(() => closed)

        expect(closed).toBe(true)
        expect(document.getElementById('realChild')).toBeNull()
      })
    })
  })
})
