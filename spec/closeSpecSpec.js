define(['iframeResizerParent'], function (iframeResize) {
  describe('Close iFrame', () => {
    var iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('closes from parent', function (done) {
      var evtCounter = 0

      iframe = iframeResize({
        id: 'close1',
        onClosed: () => {
          setTimeout(done, 0)
        },
      })[0]

      setTimeout(iframe.iFrameResizer.close, 1)
    })

    it('closes from iframe', function (done) {
      var evtCounter = 0

      iframe = iframeResize({
        id: 'close2',
        onClosed: () => {
          setTimeout(done, 0)
        },
        onReady: function (iframe) {
          iframe.iFrameResizer.sendMessage('close')
        },
      })[0]

      mockMsgFromIFrame(iframe, 'close')
    })
  })
})
