define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init(Double)', () => {
    let iframe

    beforeAll(() => {
      loadIFrame('iframe600WithId.html')
      //spyOn(console,'warn');
    })

    afterAll(() => {
      tearDown(iframe)
    })

    it('should create iFrameResizer object', () => {
      window.parentIFrame = {
        getId: () => 'getIdTest',
      }

      iframe = iframeResize({}, '#doubleTest')[0]
      iframeResize({}, '#doubleTest')

      expect(iframe.iFrameResizer).toBeDefined()
      expect(console.warn).toHaveBeenCalled()

      delete window.parentIFrame
    })
  })
})
