/* jshint undef: false, unused: true */

'use strict'

define(['iframeResizer'], function(iFrameResize) {
  describe('iFrame init(DOM Object)', function() {
    var iframe

    beforeAll(function() {
      loadIFrame('iframe600.html')

      iframe = iFrameResize(
        undefined,
        document.getElementsByTagName('iframe')[0]
      )[0]
    })

    afterAll(function() {
      tearDown(iframe)
    })

    it('should create iFrameResizer object', function() {
      expect(iframe.iFrameResizer).toBeDefined()
    })
  })
})
