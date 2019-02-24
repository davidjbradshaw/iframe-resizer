/* jshint undef: false, unused: true */

'use strict'

define(['iframeResizer', 'jquery'], function(iFrameResize, $) {
  describe('iFrame init(jQuery)', function() {
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
