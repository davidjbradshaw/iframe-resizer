define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init(DOM Object)', () => {
    xit('should create iframeResizer object', (done) => {
      loadIFrame('iframe600.html')

      iframeResize(
        {
          license: 'GPLv3',
          warningTimeout: 1000,
          onReady: (iframe) => {
            expect(iframe.iframeResizer).toBeDefined()
            tearDown(iframe)
            done()
          },
        },
        document.getElementsByTagName('iframe')[0],
      )
    })
  })
})
