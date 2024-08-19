define(['iframeResizerParent'], (iframeResize) => {
  xdescribe('jump to anchor', () => {
    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('requested from host page', (done) => {
      iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor1',
        warningTimeout: 1000,
        onReady: (iframe1) => {
          spyOnIFramePostMessage(iframe1)

          iframe1.iFrameResizer.moveToAnchor('testAnchor')

          expect(iframe1.contentWindow.postMessage).toHaveBeenCalledWith(
            '[iFrameSizer]moveToAnchor:testAnchor',
            getTarget(iframe1),
          )

          tearDown(iframe1)
          done()
        },
      })
    })

    it('mock incoming message', (done) => {
      const iframe2 = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor2',
        warningTimeout: 1000,
        onReady: (iframe2) => {
          mockMsgFromIFrame(iframe2, 'inPageLink:#anchorParentTest')
        },
        onScroll: (position) => {
          expect(position.x).toBe(8)
          expect(position.y).toBeGreaterThan(8)
          tearDown(iframe2)
          done()
        },
      })[0]
    })

    it('mock incoming message to parent', (done) => {
      const iframe3 = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor3',
        warningTimeout: 1000,
        onReady: (iframe3) => {
          mockMsgFromIFrame(iframe3, 'inPageLink:#anchorParentTest2')
        },
      })[0]

      window.parentIFrame = {
        moveToAnchor: () => {
          tearDown(iframe3)
          done()
        },
      }
    })
  })
})
