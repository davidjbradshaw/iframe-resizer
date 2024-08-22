define(['iframeResizerJquery', 'jquery'], (iframeResize, $) => {
  describe('iFrame init(jQuery)', () => {
    loadIFrame('iframe600.html')

    it('is callable', () => {
      const iframe = $('iframe').iframeResize({
        license: 'GPLv3',
        log: true,
        warningTimeout: 100,
      })[0]

      tearDown(iframe)
    })

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
