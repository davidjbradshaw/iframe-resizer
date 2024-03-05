

'use strict'

define(['iframeResizerParent'], function(iframeResize) {
  describe('iFrame init(Double)', function() {
    var iframe

    beforeAll(function() {
      loadIFrame('iframe600WithId.html')
      //spyOn(console,'warn');
    })

    afterAll(function() {
      tearDown(iframe)
    })

    it('should create iFrameResizer object', function() {
      window.parentIFrame = {
        getId: function() {
          return 'getIdTest'
        }
      }
      iframe = iframeResize({ log: LOG }, '#doubleTest')[0]
      iframeResize({ log: LOG }, '#doubleTest')
      expect(iframe.iFrameResizer).toBeDefined()
      expect(console.warn).toHaveBeenCalled()
      delete window.parentIFrame
    })
  })
})
