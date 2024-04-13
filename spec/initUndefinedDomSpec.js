'use strict'

define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init(DOM Object)', function () {
    var iframe

    beforeAll(function () {
      loadIFrame('iframe600.html')

      iframe = iframeResize(
        undefined,
        document.getElementsByTagName('iframe')[0],
      )[0]
    })

    afterAll(function () {
      tearDown(iframe)
    })

    it('should create iFrameResizer object', function () {
      expect(iframe.iFrameResizer).toBeDefined()
    })
  })
})
