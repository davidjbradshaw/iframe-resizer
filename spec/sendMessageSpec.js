define(['iframeResizerParent'], function (iframeResize) {
  describe('Send Message from Host Page', () => {
    var iframe
    const log = LOG

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    it('send message to iframe', function (done) {
      var iframe1 = iframeResize({
        log,
        id: 'sendMessage1',
      })[0]

      spyOnIFramePostMessage(iframe1)
      setTimeout(() => {
        iframe1.iFrameResizer.sendMessage('chkSendMsg:test')
        expect(iframe1.contentWindow.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]message:"chkSendMsg:test"',
          getTarget(iframe1),
        )
        tearDown(iframe1)
        done()
      }, 100)
    })

    it('mock incoming message', function (done) {
      iframe = iframeResize({
        log,
        id: 'sendMessage2',
        onMessage: function (messageData) {
          expect(messageData.message).toBe('test:test')
          done()
        },
      })[0]

      mockMsgFromIFrame(iframe, 'message:"test:test"')
    })

    xit('send message and get response', function (done) {
      iframe = iframeResize({
        log,
        id: 'sendMessage3',
        onReady: function (iframe) {
          iframe.iFrameResizer.sendMessage('chkSendMsg')
        },
        onMessage: function (messageData) {
          expect(messageData.message).toBe('message: test string')
          done()
        },
      })[0]
    })
  })
})
