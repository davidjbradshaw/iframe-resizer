define(['iframeResizerJquery', 'jquery'], (iframeResize, $) => {
  xdescribe('iFrame init(jQuery)', () => {
    let iframe

    beforeAll(() => {
      loadIFrame('iframe600.html')

      const $iframes = $('iframe').iframeResize()

      iframe = $iframes.get(0)
    })

    afterAll(() => {
      tearDown(iframe)
    })

    it('should create iFrameResizer object', () => {
      expect(iframe.iFrameResizer).toBeDefined()
    })
  })
})
it