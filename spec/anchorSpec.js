define(['iframeResizerParent'], (iframeResize) => {
  describe('jump to anchor', () => {
    let iframe
    const log = LOG
    // const testId = 'anchor'

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    it('requested from host page', (done) => {
      const iframe1 = iframeResize({
        log,
        id: 'anchor1',
      })[0]

      spyOnIFramePostMessage(iframe1)
      setTimeout(() => {
        iframe1.iFrameResizer.moveToAnchor('testAnchor')
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
        log,
        id: 'anchor2',
        onScroll: (position) => {
          expect(position.x).toBe(8)
          expect(position.y).toBeGreaterThan(8)
          done()
        },
      })[0]

      mockMsgFromIFrame(iframe2, 'inPageLink:#anchorParentTest')
    })

    it('mock incoming message to parent', (done) => {
      const iframe3 = iframeResize({
        log,
        id: 'anchor3',
      })[0]

      window.parentIFrame = {
        moveToAnchor: () => {
          done()
        },
      }

      mockMsgFromIFrame(iframe3, 'inPageLink:#anchorParentTest2')
    })
  })
})
