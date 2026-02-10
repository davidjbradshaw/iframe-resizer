define(['iframeResizerParent'], (iframeResize) => {
  describe('jump to anchor', () => {
    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('requested from host page', (done) => {
      const iframe1 = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor1',
        warningTimeout: 1000,
      })[0]

      // Mock iframe as ready
      mockMsgFromIFrame(iframe1, 'reset')

      setTimeout(() => {
        spyOnIFramePostMessage(iframe1)

        iframe1.iframeResizer.moveToAnchor('testAnchor')

        expect(iframe1.contentWindow.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]moveToAnchor:testAnchor',
          getTarget(iframe1),
        )

        tearDown(iframe1)
        done()
      }, 100)
    })

    it('mock incoming message', (done) => {
      const iframe2 = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor2',
        warningTimeout: 1000,
        onScroll: (position) => {
          expect(position.x).toBe(8)
          expect(position.y).toBeGreaterThan(8)
          tearDown(iframe2)
          done()
        },
      })[0]

      // Mock iframe as ready and then send the message
      mockMsgFromIFrame(iframe2, 'reset')
      setTimeout(() => {
        mockMsgFromIFrame(iframe2, 'inPageLink:#anchorParentTest')
      }, 100)
    })

    xit('mock incoming message to parent', (done) => {
      const iframe3 = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'anchor3',
        warningTimeout: 1000,
      })[0]

      window.parentIFrame = {
        moveToAnchor: () => {
          tearDown(iframe3)
          done()
        },
      }

      // Mock iframe as ready and then send the message
      mockMsgFromIFrame(iframe3, 'reset')
      setTimeout(() => {
        mockMsgFromIFrame(iframe3, 'inPageLink:#anchorParentTest2')
      }, 200)
    })
  })
})
