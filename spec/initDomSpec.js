define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init(DOM Object)', () => {
    xit('should create iFrameResizer object', (done) => {
      loadIFrame('iframe600.html')

      iframeResize(
        {
          license: 'GPLv3',
          warningTimeout: 1000,
          onReady: (iframe) => {
            expect(iframe.iFrameResizer).toBeDefined()
            tearDown(iframe)
            done()
          },
        },
        document.getElementsByTagName('iframe')[0],
      )
    })
  })
})
