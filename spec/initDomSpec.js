define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init(DOM Object)', () => {
    it('should create iframeResizer object', (done) => {
      loadIFrame('iframe600.html')
      const iframe = document.getElementsByTagName('iframe')[0]
      let called = false

      iframeResize(
        {
          license: 'GPLv3',
          warningTimeout: 1000,
          checkOrigin: false,
          onReady: (iframe) => {
            if (called) return
            called = true
            expect(iframe.iframeResizer).toBeDefined()
            tearDown(iframe)
            done()
          },
        },
        iframe,
      )

      // Mock the init message from child
      mockMsgFromIFrame(iframe, 'init')
    })
  })
})
