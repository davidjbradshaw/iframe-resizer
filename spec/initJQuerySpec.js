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

    it('is callable and chainable', () => {
      const $iframe = $(iframe)
      const result = $iframe.iframeResize({
        license: 'GPLv3',
        log: true,
        warningTimeout: 100,
        checkOrigin: false,
      })

      expect(result).toBe($iframe)
      expect(iframe.iframeResizer).toBeDefined()
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
          setTimeout(done, 1)
        },
      })

      // Mock the init message from child
      mockMsgFromIFrame(iframe, 'init')
    })
  })
})
