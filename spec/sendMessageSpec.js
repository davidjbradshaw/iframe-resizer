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

    xit('send message to iframe', (done) => {
      const iframe1 = iframeResize({
        license: 'GPLv3',
        log,
        id: 'sendMessage1',
        warningTimeout: 1000,
        onReady: (iframe1) => {
          console.log('>>>', iframe1, iframe1.iframeResizer)
          iframe1.iframeResizer.sendMessage('chkSendMsg:test')

          expect(iframe1.contentWindow.postMessage).toHaveBeenCalledWith(
            '[iFrameSizer]message:"chkSendMsg:test"',
            getTarget(iframe1),
          )

          tearDown(iframe1)
          done()
        },
      })[0]

      spyOnIFramePostMessage(iframe1)
    })

    it('mock incoming message', (done) => {
      iframe = iframeResize({
        license: 'GPLv3',
        log,
        id: 'sendMessage2',
        warningTimeout: 1000,
        onMessage: (messageData) => {
          expect(messageData.message).toBe('test:test')
          done()
        },
      })[0]

      mockMsgFromIFrame(iframe, 'message:"test:test"')
    })

    xit('send message and get response', (done) => {
      iframe = iframeResize({
        license: 'GPLv3',
        log,
        id: 'sendMessage3',
        warningTimeout: 1000,
        onReady: (iframe) => {
          iframe.iframeResizer.sendMessage('chkSendMsg')
          console.log('>>> send message and get response')
        },
        onMessage: (messageData) => {
          expect(messageData.message).toBe('message: test string')
          done()
        },
      })[0]
    })
  })
})
