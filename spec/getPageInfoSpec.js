define(['iframeResizer'], function(iFrameResize) {
  describe('Get Page info', function() {
    var log = LOG
    var testId = 'anchor'

    beforeEach(function() {
      loadIFrame('iframe600.html')
    })

    it('requested from iFrame', function(done) {
      var iframe1 = iFrameResize({
        log: log,
        id: 'getPageInfo'
      })[0]

      spyOn(iframe1.contentWindow, 'postMessage').and.callFake(function(msg) {
        if (0 !== msg.indexOf('pageInfo')) {
          expect(
            msg.indexOf(
              '"offsetTop":0,"offsetLeft":0,"scrollTop":0,"scrollLeft":0'
            )
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

  describe('Get Page info with multiple frames', function() {
    var log = LOG

    beforeEach(function() {
      loadIFrame('twoIFrame600WithId.html')
    })

    xit('must send pageInfo to second frame', function(done) {
      var iframes = iFrameResize({
        log: log,
        id: '#frame1,#frame2',
        onInit: function(iframe) {
          iframe.iFrameResizer.sendMessage('getPageInfo')
        }
      })

      var iframe1 = iframes[0],
        iframe2 = iframes[1]

      setTimeout(function() {
        var counter = 0,
          frame1Called = false,
          frame2Called = false

        function checkCounter() {
          if (counter === 2) {
            expect(frame1Called && frame2Called).toBeTruthy()
            tearDown(iframe1)
            tearDown(iframe2)
            done()
          }
        }
        iframe1.contentWindow.postMessage = function(msg) {
          if (0 < msg.indexOf('pageInfo')) {
            frame1Called = true
            counter++
            checkCounter()
          }
        }
        iframe2.contentWindow.postMessage = function(msg) {
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
