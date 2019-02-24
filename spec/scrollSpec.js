define(['iframeResizer'], function(iFrameResize) {
  describe('Scroll Page', function() {
    var iframe
    var log = LOG

    beforeEach(function() {
      loadIFrame('iframe600.html')
    })

    afterEach(function() {
      tearDown(iframe)
    })

    it('mock incoming message', function(done) {
      iframe = iFrameResize({
        log: log,
        id: 'scroll1'
      })[0]

      window.parentIFrame = {
        scrollTo: function(x, y) {
          expect(x).toBe(0)
          expect(y).toBe(0)
          done()
        }
      }

      mockMsgFromIFrame(iframe, 'scrollTo')
    })

    it('mock incoming message', function(done) {
      iframe = iFrameResize({
        log: log,
        id: 'scroll2'
      })[0]

      window.parentIFrame = {
        scrollToOffset: function(x, y) {
          expect(x).toBe(8)
          expect(y).toBe(8)
          done()
        }
      }

      mockMsgFromIFrame(iframe, 'scrollToOffset')
    })
  })
})
