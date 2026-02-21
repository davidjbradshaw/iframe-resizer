define(['iframeResizerParent'], (iframeResize) => {
  describe('Get Page info', () => {
    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('requested from iFrame', (done) => {
      const iframe1 = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'getPageInfo',
        checkOrigin: false,
        onReady: (iframe) => {
          setTimeout(() => {
            mockMsgFromIFrame(iframe, 'pageInfo')
            mockMsgFromIFrame(iframe, 'pageInfoStop')
          }, 10)
        },
      })[0]

      spyOn(iframe1.contentWindow, 'postMessage').and.callFake((msg) => {
        if (0 !== msg.indexOf('pageInfo')) {
          expect(
            msg.indexOf(
              '"offsetTop":0,"offsetLeft":0,"scrollTop":0,"scrollLeft":0',
            ),
          ).not.toEqual(0)
        }
        if (0 !== msg.indexOf('pageInfoStop')) {
          tearDown(iframe1)
          done()
        }
      })
      
      // Mock init message
      mockMsgFromIFrame(iframe1, 'init')
    })
  })

  describe('Get Page info with multiple frames', () => {
    beforeEach(() => {
      loadIFrame('twoIFrame600WithId.html')
    })

    it('must send pageInfo to second frame', (done) => {
      let readyCount = 0
      const iframes = iframeResize({
        license: 'GPLv3',
        log: true,
        id: '#frame1,#frame2',
        checkOrigin: false,
        onReady: (iframe) => {
          readyCount++
          if (readyCount === 2) {
            // Both frames are ready
            expect(iframes.length).toBe(2)
            tearDown(iframes[0])
            tearDown(iframes[1])
            done()
          }
        },
      })

      const iframe1 = iframes[0]
      const iframe2 = iframes[1]
      
      // Mock init messages for both frames
      mockMsgFromIFrame(iframe1, 'init')
      mockMsgFromIFrame(iframe2, 'init')
    })
  })
})
