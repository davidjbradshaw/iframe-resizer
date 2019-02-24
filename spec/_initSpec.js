define(['iframeResizer'], function(iFrameResize) {
  describe('iFrame init', function() {
    var iframe
    var id = 'initTest'

    beforeEach(function(done) {
      loadIFrame('iframe600.html')

      iframe = iFrameResize({
        log: LOG,
        id: id + '-',
        autoResize: false,
        bodyMargin: 1,
        checkOrigin: false,
        inPageLinks: true,
        interval: 0,
        maxHeight: 100,
        minHeight: 10,
        maxWidth: 100,
        minWidth: 10,
        scrolling: true,
        sizeHeight: false,
        sizeWidth: true,
        tolerance: 1,
        onInit: function() {
          setTimeout(done, 1)
        }
      })[0]
    })

    afterEach(function() {
      //tearDown(iframe);
    })

    it('should add an ID', function() {
      expect(iframe.id.split('-')[0]).toBe(id)
    })

    describe('methods', function() {
      it('should create iFrameResizer object', function() {
        expect(iframe.iFrameResizer).toBeDefined()
      })

      it('should create a close method', function() {
        expect(iframe.iFrameResizer.close).toBeDefined()
      })

      it('should create a resize method', function() {
        expect(iframe.iFrameResizer.resize).toBeDefined()
      })

      it('should create a moveToAnchor method', function() {
        expect(iframe.iFrameResizer.moveToAnchor).toBeDefined()
      })

      it('should create a sendMessage method', function() {
        expect(iframe.iFrameResizer.sendMessage).toBeDefined()
      })
    })
  })
})
