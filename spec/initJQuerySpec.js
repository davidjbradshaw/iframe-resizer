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

    xit('should create iframeResizer object', (done) => {
      const $iframe = $('iframe').iframeResize({
        license: 'GPLv3',
        log: true,
        warningTimeout: 1000,
      })
      
      const iframe = $iframe[0]

      // Mock iframe as ready
      setTimeout(() => {
        mockMsgFromIFrame(iframe, 'reset')
        
        expect(iframe.iframeResizer).toBeDefined()
        tearDown(iframe)
        done()
      }, 50)
    })
  })
})
