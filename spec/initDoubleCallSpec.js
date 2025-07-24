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

    it('should create iframeResizer object', () => {
      window.parentIFrame = {
        getId: () => 'getIdTest',
      }

      iframe = iframeResize({ license: 'GPLv3' }, '#doubleTest')[0]
      iframeResize(
        {
          license: 'GPLv3',
          onReady: (done) => {
            expect(iframe.iframeResizer).toBeDefined()
            // eslint-disable-next-line jasmine/prefer-toHaveBeenCalledWith
            expect(console.warn).toHaveBeenCalled()
            delete window.parentIFrame
            done()
          },
        },
        '#doubleTest',
      )
    })
  })
})
