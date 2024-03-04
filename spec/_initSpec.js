define(['iframeResizer'], function(iFrameResize) {
  xdescribe('iFrame init', function() {
    var iframe
    var id = 'initTest'

    beforeEach(function(done) {
      loadIFrame('iframe600.html')

      iframe = iFrameResize({
        log: LOG,
        id: id + '-',
        checkOrigin: false,
        inPageLinks: true,
        scrolling: true,
        tolerance: 1,
        direction: 'horizontal',
        onReady: function() {
          setTimeout(done, 1)
        }
      })[0]

      console.log('iframe', iframe)
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
