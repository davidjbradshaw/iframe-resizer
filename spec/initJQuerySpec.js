define(['iframeResizerJquery', 'jquery'], (iframeResize, $) => {
  describe('iFrame init(jQuery)', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
      iframe = $('iframe')[0]
    })

    afterEach(() => {
      tearDown(iframe)
    })

    it('is callable', () => {
      $(iframe).iframeResize({
        license: 'GPLv3',
        log: true,
        warningTimeout: 100,
        checkOrigin: false,
      })
    })

    it('should create iframeResizer object', (done) => {
      let finished = false

      $(iframe).iframeResize({
        license: 'GPLv3',
        log: true,
        warningTimeout: 1000,
        checkOrigin: false,
        onReady: (iframe) => {
          if (finished) return
          finished = true
          expect(iframe.iframeResizer).toBeDefined()
          done()
        },
      })

      // Mock the init message from child
      mockMsgFromIFrame(iframe, 'init')
    })
  })
})
