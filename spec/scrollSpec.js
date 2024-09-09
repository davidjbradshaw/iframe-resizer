define(['iframeResizerParent'], (iframeResize) => {
  describe('Scroll Page', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    it('mock incoming message (scrollTo)', (done) => {
      iframe = iframeResize({ license: 'GPLv3', log: true, id: 'scroll1' })[0]

      window.parentIframe = {
        scrollTo: (x, y) => {
          expect(x).toBe(0)
          expect(y).toBe(0)
          done()
          return false
        },
      }

      mockMsgFromIFrame(iframe, 'scrollTo')
    })

    it('mock incoming message (scrollToOffset)', (done) => {
      iframe = iframeResize({ license: 'GPLv3', log: true, id: 'scroll2' })[0]

      window.parentIframe = {
        scrollToOffset: (x, y) => {
          expect(x).toBe(8)
          expect(y).toBe(8)
          done()
          return false
        },
      }

      mockMsgFromIFrame(iframe, 'scrollToOffset')
    })
  })
})
