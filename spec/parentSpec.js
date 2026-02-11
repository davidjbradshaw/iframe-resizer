define(['iframeResizerParent'], (iframeResize) => {
  describe('Parent Page', () => {
    describe('default resize', () => {
      const testId = 'defaultResize3'

      let iframe
      let ready
      let finished

      beforeEach((done) => {
        finished = false
        loadIFrame('iframe600.html')
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: testId,
          warningTimeout: 1000,
          checkOrigin: false,
          onResized: () => {
            if (finished) return
            finished = true
            ready = true
            done()
          },
        })[0]

        // Send init first, then a resize message
        mockMsgFromIFrame(iframe, 'init')
        setTimeout(() => {
          window.postMessage(`[iFrameSizer]${testId}:100:200:mutationObserver`, '*')
        }, 10)
      })

      afterEach(() => {
        tearDown(iframe)
      })

      it('receive message', () => {
        expect(ready).toBe(true)
      })
    })

    describe('reset Page', () => {
      let iframe

      const testId = 'parentPage1'

      beforeEach((done) => {
        loadIFrame('iframe600.html')
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: testId,
          checkOrigin: false,
          onReady: () => {
            // Wait for onReady callback before sending reset message to ensure iframe is initialized
            setTimeout(() => {
              mockMsgFromIFrame(iframe, 'reset')
              // Give time for reset message to be processed
              setTimeout(done, 50)
            }, 10)
          },
        })[0]

        spyOn(iframe.contentWindow, 'postMessage')

        // Send init first
        mockMsgFromIFrame(iframe, 'init')
      })

      afterEach(() => {
        tearDown(iframe)
      })

      it('receive message 2', () => {
        expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]reset',
          '*',
        )
      })
    })

    describe('late load msg received', () => {
      let iframe

      const testId = 'parentPage2'

      beforeEach((done) => {
        loadIFrame('iframe600.html')
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: testId,
          checkOrigin: false,
        })[0]

        spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
          // Call done after first postMessage
          done()
        })

        // Send ready message from child
        window.postMessage('[iframeResizerChild]Ready', '*')
      })

      afterEach(() => {
        tearDown(iframe)
      })

      it('receive message 3', () => {
        const calls = iframe.contentWindow.postMessage.calls.all()
        // Verify init message was sent
        expect(calls.length).toBeGreaterThan(0)
        expect(calls[0].args[0]).toContain('[iFrameSizer]parentPage2:')
        expect(calls[0].args[1]).toBe('*')
      })
    })

    describe('resize height', () => {
      let iframe
      const testId = 'parentPage3'
      const HEIGHT = 90
      const extraHeights = [1, 2, 3, 4]

      const setUp = (boxSizing, units) => {
        loadIFrame('iframe.html')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: testId,
          checkOrigin: false,
        })[0]

        iframe.style.boxSizing = boxSizing
        iframe.style.paddingTop = extraHeights[0] + units
        iframe.style.paddingBottom = extraHeights[1] + units
        iframe.style.borderTop = `${extraHeights[2]}${units} solid`
        iframe.style.borderBottom = `${extraHeights[3]}${units} solid`

        // Mock init message
        mockMsgFromIFrame(iframe, 'init')

        // needs timeout so postMessage always comes after 'ready' postMessage
        setTimeout(() => {
          window.postMessage(
            `[iFrameSizer]${testId}:${HEIGHT}:600:mutationObserver`,
            '*',
          )
        })
      }

      afterEach(() => {
        tearDown(iframe)
      })

      it('includes padding and borders from "px" units in height when CSS "box-sizing" is set to "border-box"', (done) => {
        setUp('border-box', 'px')

        // timeout needed because of requestAnimationFrame and must be more than window.postMessage in setUp
        setTimeout(() => {
          expect(iframe.offsetHeight).toBe(
            HEIGHT + extraHeights.reduce((a, b) => a + b, 0),
          )
          done()
        }, 160)
      })

      it('includes padding and borders from "rem" units in height when CSS "box-sizing" is set to "border-box"', (done) => {
        const REM = 14

        // changes the rem units of the doc so we can test accurately
        document.querySelector('html').style.fontSize = `${REM}px`

        setUp('border-box', 'rem')

        // timeout needed because of requestAnimationFrame and must be more than window.postMessage in setUp
        setTimeout(() => {
          expect(iframe.offsetHeight).toBe(
            HEIGHT + extraHeights.reduce((a, b) => a + b * REM, 0),
          )
          done()
        }, 160)
      })

      it('includes padding and borders from "px" units in height when CSS "box-sizing" is set to "content-box"', (done) => {
        setUp('content-box', 'px')

        // timeout needed because of requestAnimationFrame and must be more than window.postMessage in setUp
        setTimeout(() => {
          expect(iframe.offsetHeight).toBe(
            HEIGHT + extraHeights.reduce((a, b) => a + b, 0),
          )
          done()
        }, 160)
      })
    })
  })
})
