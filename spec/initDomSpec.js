define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init(DOM Object)', () => {
    it('should create iframeResizer object', () => {
      loadIFrame('iframe600.html')

      iframeResize(
        {
          license: 'GPLv3',
          warningTimeout: 1000,
        },
        document.getElementsByTagName('iframe')[0],
      )

      const iframe = document.getElementsByTagName('iframe')[0]

      // Mock iframe as ready
      mockMsgFromIFrame(iframe, 'reset')

      expect(iframe.iframeResizer).toBeDefined()
      tearDown(iframe)
    })
  })
})
