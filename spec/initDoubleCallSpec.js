define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init(Double)', () => {
    let iframe

    beforeAll(() => {
      loadIFrame('iframe600WithId.html')
      spyOn(console, 'warn')
    })

    afterAll(() => {
      tearDown(iframe)
    })

    it('should create iframeResizer object and handle double initialization', () => {
      window.parentIFrame = {
        getId: () => 'getIdTest',
      }

      iframe = iframeResize({ license: 'GPLv3', log: true }, '#doubleTest')[0]
      const result = iframeResize({ license: 'GPLv3', log: true }, '#doubleTest')

      expect(iframe.iframeResizer).toBeDefined()
      expect(result[0].iframeResizer).toBeDefined()
      delete window.parentIFrame
    })
  })
})
