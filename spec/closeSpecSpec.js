define(['iframeResizer'], function(iFrameResize) {
  describe('Close iFrame', function() {
    var iframe

    beforeEach(function() {
      loadIFrame('iframe600.html')
    })

    it('closes from parent', function(done) {
      var evtCounter = 0

      iframe = iFrameResize({
        log: LOG,
        id: 'close1',
        onClosed: function() {
          setTimeout(done, 0)
        }
      })[0]

      setTimeout(iframe.iFrameResizer.close, 1)
    })

    it('closes from iframe', function(done) {
      var evtCounter = 0

      iframe = iFrameResize({
        log: LOG,
        id: 'close2',
        onClosed: function() {
          setTimeout(done, 0)
        },
        onInit: function(iframe) {
          iframe.iFrameResizer.sendMessage('close')
        }
      })[0]

      mockMsgFromIFrame(iframe, 'close')
    })
  })
})
