define(['iframeResizer'], function (iFrameResize) {
  describe('Parent Page', function () {
    describe('default resize', function () {
      var iframe
      var log = LOG
      var testId = 'defaultResize3'
      var ready

      beforeEach(function (done) {
        loadIFrame('iframe600.html')
        iframe = iFrameResize({
          log: log,
          id: testId,
          onResized: function () {
            ready = true
            done()
          }
        })[0]

        mockMsgFromIFrame(iframe, 'foo')
      })

      afterEach(function () {
        tearDown(iframe)
      })

      it('receive message', function () {
        expect(ready).toBe(true)
      })
    })

    xdescribe('reset Page', function () {
      var iframe
      var log = LOG
      var testId = 'parentPage1'

      beforeEach(function (done) {
        loadIFrame('iframe600.html')
        iframe = iFrameResize({
          log: log,
          id: testId
        })[0]

        spyOn(iframe.contentWindow, 'postMessage').and.callFake(done)
        mockMsgFromIFrame(iframe, 'reset')
      })

      afterEach(function () {
        tearDown(iframe)
      })

      it('receive message', function () {
        expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]reset',
          'http://localhost:9876'
        )
      })
    })

    xdescribe('late load msg received', function () {
      var iframe
      var log = LOG
      var testId = 'parentPage2'

      beforeEach(function (done) {
        loadIFrame('iframe600.html')
        iframe = iFrameResize({
          log: log,
          id: testId
        })[0]

        spyOn(iframe.contentWindow, 'postMessage').and.callFake(done)
        window.postMessage('[iFrameResizerChild]Ready', '*')
      })

      afterEach(function () {
        tearDown(iframe)
      })

      it('receive message', function () {
        expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentPage2:8:false:true:32:true:true:null:bodyOffset:null:null:0:false:parent:scroll:true',
          'http://localhost:9876'
        )
      })
    })

    describe('resize height', function () {
      var iframe
      var log = LOG
      var testId = 'parentPage3'
      var HEIGHT = 90
      var extraHeights = [1, 2, 3, 4]

      var setUp = (boxSizing, units) => {
        loadIFrame('iframe.html')

        iframe = iFrameResize({
          log: log,
          id: testId
        })[0]

        iframe.style.boxSizing = boxSizing
        iframe.style.paddingTop = extraHeights[0] + units
        iframe.style.paddingBottom = extraHeights[1] + units
        iframe.style.borderTop = `${extraHeights[2]}${units} solid`
        iframe.style.borderBottom = `${extraHeights[3]}${units} solid`

        spyPostMsg = spyOn(iframe.contentWindow, 'postMessage')

        // needs timeout so postMessage always comes after 'ready' postMessage
        setTimeout(() => {
          window.postMessage(
            `[iFrameSizer]${testId}:${HEIGHT}:600:mutationObserver`,
            '*'
          )
        }, 0)
      }

      afterEach(function () {
        tearDown(iframe)
      })

      it('includes padding and borders from "px" units in height when CSS "box-sizing" is set to "border-box"', (done) => {
        setUp('border-box', 'px')

        // timeout needed because of requestAnimationFrame and must be more than window.postMessage in setUp
        setTimeout(() => {
          expect(iframe.offsetHeight).toBe(
            HEIGHT + extraHeights.reduce((a, b) => a + b, 0)
          )
          done()
        }, 100)
      })

      it('includes padding and borders from "rem" units in height when CSS "box-sizing" is set to "border-box"', (done) => {
        const REM = 14

        // changes the rem units of the doc so we can test accurately
        document.querySelector('html').style.fontSize = `${REM}px`

        setUp('border-box', 'rem')

        // timeout needed because of requestAnimationFrame and must be more than window.postMessage in setUp
        setTimeout(() => {
          expect(iframe.offsetHeight).toBe(
            HEIGHT + extraHeights.reduce((a, b) => a + b * REM, 0)
          )
          done()
        }, 100)
      })

      it('includes padding and borders from "px" units in height when CSS "box-sizing" is set to "content-box"', (done) => {
        setUp('content-box', 'px')

        // timeout needed because of requestAnimationFrame and must be more than window.postMessage in setUp
        setTimeout(() => {
          expect(iframe.offsetHeight).toBe(
            HEIGHT + extraHeights.reduce((a, b) => a + b, 0)
          )
          done()
        }, 100)
      })
    })
  })
})
