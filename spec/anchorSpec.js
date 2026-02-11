define(['iframeResizerParent'], (iframeResize) => {
  describe('jump to anchor', () => {
    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('requested from host page', (done) => {
      iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor1',
        warningTimeout: 1000,
        checkOrigin: false,
        onReady: (iframe1) => {
          spyOn(iframe1.contentWindow, 'postMessage')

          iframe1.iframeResizer.moveToAnchor('testAnchor')

          expect(iframe1.contentWindow.postMessage).toHaveBeenCalledWith(
            '[iFrameSizer]moveToAnchor:testAnchor',
            '*',
          )

          tearDown(iframe1)
          done()
        },
      })
      
      // Mock init message
      const iframe = document.getElementsByTagName('iframe')[0]
      mockMsgFromIFrame(iframe, 'init')
    })

    it('mock incoming message', (done) => {
      const iframe2 = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor2',
        warningTimeout: 1000,
        checkOrigin: false,
        onReady: (iframe2) => {
          setTimeout(() => {
            mockMsgFromIFrame(iframe2, 'inPageLink:#anchorParentTest')
          }, 10)
        },
        onScroll: (position) => {
          expect(position.x).toBe(8)
          expect(position.y).toBeGreaterThan(8)
          tearDown(iframe2)
          done()
        },
      })[0]
      
      // Mock init message
      mockMsgFromIFrame(iframe2, 'init')
    })

    it('mock incoming message to parent', (done) => {
      window.parentIFrame = {
        moveToAnchor: () => {
          done()
        },
      }
      
      const iframe3 = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor3',
        warningTimeout: 1000,
        checkOrigin: false,
        onReady: (iframe3) => {
          setTimeout(() => {
            mockMsgFromIFrame(iframe3, 'inPageLink:#anchorParentTest2')
          }, 10)
        },
      })[0]
      
      // Mock init message
      mockMsgFromIFrame(iframe3, 'init')
      
      // Cleanup in case test fails
      setTimeout(() => {
        tearDown(iframe3)
      }, 3000)
    })
  })
})
