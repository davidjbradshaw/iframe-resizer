define(['iframeResizerParent'], (iframeResize) => {
  describe('Get Page info', () => {
    const log = LOG
    // const testId = 'anchor'

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('requested from iFrame', (done) => {
      const iframe1 = iframeResize({
        log,
        id: 'getPageInfo',
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

      mockMsgFromIFrame(iframe1, 'pageInfo')
      mockMsgFromIFrame(iframe1, 'pageInfoStop')
    })
  })

  describe('Get Page info with multiple frames', () => {
    const log = LOG

    beforeEach(() => {
      loadIFrame('twoIFrame600WithId.html')
    })

    xit('must send pageInfo to second frame', (done) => {
      const iframes = iframeResize({
        log,
        id: '#frame1,#frame2',
        onReady: (iframe) => {
          iframe.iFrameResizer.sendMessage('getPageInfo')
        },
      })

      const iframe1 = iframes[0]
      const iframe2 = iframes[1]

      setTimeout(() => {
        let counter = 0
        let frame1Called = false
        let frame2Called = false

        function checkCounter() {
          if (counter === 2) {
            expect(frame1Called && frame2Called).toBeTruthy()
            tearDown(iframe1)
            tearDown(iframe2)
            done()
          }
        }
        iframe1.contentWindow.postMessage = function (msg) {
          if (0 < msg.indexOf('pageInfo')) {
            frame1Called = true
            counter++
            checkCounter()
          }
        }
        iframe2.contentWindow.postMessage = function (msg) {
          if (0 < msg.indexOf('pageInfo')) {
            frame2Called = true
            counter++
            checkCounter()
          }
        }

        window.dispatchEvent(new Event('resize'))
      }, 200)
    })
  })
})
