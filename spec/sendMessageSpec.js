define(['iframeResizerParent'], (iframeResize) => {
  describe('Send Message from Host Page', () => {
    let iframe
    const log = LOG

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    it('send message to iframe', (done) => {
      iframe = document.getElementsByTagName('iframe')[0]
      iframe.id = 'sendMessage1'

      spyOn(iframe.contentWindow, 'postMessage')

      const iframe1 = iframeResize({
        license: 'GPLv3',
        log,
        id: 'sendMessage1',
        warningTimeout: 1000,
        checkOrigin: false, // Disabled for testing - allows wildcard origin
        onReady: (iframe1) => {
          iframe1.iframeResizer.sendMessage('chkSendMsg:test')

          // Using '*' as target origin is acceptable in tests with checkOrigin disabled
          expect(iframe1.contentWindow.postMessage).toHaveBeenCalledWith(
            '[iFrameSizer]message:"chkSendMsg:test"',
            '*',
          )

          done()
        },
      })[0]

      // Mock the init message from child
      mockMsgFromIFrame(iframe, 'init')
    })

    it('mock incoming message', (done) => {
      iframe = iframeResize({
        license: 'GPLv3',
        log,
        id: 'sendMessage2',
        warningTimeout: 1000,
        checkOrigin: false,
        onMessage: (messageData) => {
          expect(messageData.message).toBe('test:test')
          done()
        },
      })[0]

      mockMsgFromIFrame(iframe, 'message:"test:test"')
    })

    it('send message and get response', (done) => {
      iframe = document.getElementsByTagName('iframe')[0]
      iframe.id = 'sendMessage3'

      iframeResize({
        license: 'GPLv3',
        log,
        id: 'sendMessage3',
        warningTimeout: 1000,
        checkOrigin: false,
        onReady: (iframe) => {
          iframe.iframeResizer.sendMessage('chkSendMsg')
        },
        onMessage: (messageData) => {
          expect(messageData.message).toBe('message: test string')
          done()
        },
      })[0]

      // Mock the init message from child
      mockMsgFromIFrame(iframe, 'init')

      // Mock response from child after a short delay
      setTimeout(() => {
        mockMsgFromIFrame(iframe, 'message:"message: test string"')
      }, 50)
    })
  })
})
