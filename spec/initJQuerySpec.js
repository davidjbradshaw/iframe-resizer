define(['iframeResizerJquery', 'jquery'], (iframeResize, $) => {
  describe('iFrame init(jQuery)', () => {
    loadIFrame('iframe600.html')

    xit('should create iFrameResizer object', (done) => {
      $('iframe').iframeResize({
        license: 'GPLv3',
        log: true,
        warningTimeout: 1000,
        onReady: (iframe) => {
          expect(iframe.iFrameResizer).toBeDefined()
          tearDown(iframe)
          done()
        },
      })
    })
  })
})
