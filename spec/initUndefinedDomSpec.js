define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init(DOM Object)', () => {
    let iframe

    beforeAll(() => {
      loadIFrame('iframe600.html')

      iframe = iframeResize(
        {
          license: 'GPLv3',
        },
        document.getElementsByTagName('iframe')[0],
      )[0]
    })

    afterAll(() => {
      tearDown(iframe)
    })

    it('should create iFrameResizer object', () => {
      expect(iframe.iFrameResizer).toBeDefined()
    })
  })
})
