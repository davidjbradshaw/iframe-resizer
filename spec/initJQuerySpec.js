

'use strict'

define(['iframeResizerJquery', 'jquery'], function(iFrameResize, $) {
  xdescribe('iFrame init(jQuery)', function() {
    var iframe

    beforeAll(function() {
      loadIFrame('iframe600.html')

      var $iframes = $('iframe').iFrameResize()

      iframe = $iframes.get(0)
    })

    afterAll(function() {
      tearDown(iframe)
    })

    it('should create iFrameResizer object', function() {
      expect(iframe.iFrameResizer).toBeDefined()
    })
  })
})
it