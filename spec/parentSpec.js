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
            setTimeout(done, 1)
          },
        })[0]

        // Send init first, then a resize message
        mockMsgFromIFrame(iframe, 'init')
        setTimeout(() => {
          window.postMessage(
            `[iFrameSizer]${testId}:100:200:mutationObserver`,
            '*',
          )
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

    // A child that loads after the parent has given up sends a ready
    // message, which has to start the handshake again. It only counts from
    // the iframe's own window, and the spelling is part of the protocol.
    describe('late load msg received', () => {
      let iframe

      const testId = 'parentPage2'

      beforeEach(() => {
        loadIFrame('iframe600.html')
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: testId,
          checkOrigin: false,
        })[0]
      })

      afterEach(() => {
        tearDown(iframe)
      })

      it('sends init again when the child reports ready', async () => {
        const postMessage = await spyOnIframeMessages(iframe)

        // Past the init that sendInit makes on its own
        await delay(50)
        postMessage.calls.reset()

        mockChildReady(iframe)
        await delay(50)

        const fields = initMsgFields(postMessage)

        expect(fields).withContext('no init message was sent').toBeDefined()
        expect(fields[0]).toBe(testId)
        expect(postMessage.calls.first().args[1]).toBe('*')
      })

      it('ignores a ready message that is not from the iframe', async () => {
        const postMessage = await spyOnIframeMessages(iframe)

        await delay(50)
        postMessage.calls.reset()

        window.dispatchEvent(
          new MessageEvent('message', {
            data: '[iFrameResizerChild]Ready',
            origin: window.location.origin,
            source: window,
          }),
        )
        await delay(50)

        expect(initMsgFields(postMessage)).not.toBeDefined()
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
        // The rem spec changes it, and a later spec's rem sizes depend on it
        document.querySelector('html').style.fontSize = ''
        tearDown(iframe)
      })

      it('includes padding and borders from "px" units in height when CSS "box-sizing" is set to "border-box"', (done) => {
        setUp('border-box', 'px')

        // timeout needed because of requestAnimationFrame and must be more than window.postMessage in setUp
        setTimeout(() => {
          expect(iframe.offsetHeight).toBe(
            HEIGHT + extraHeights.reduce((a, b) => a + b, 0),
          )
          setTimeout(done, 1)
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
          setTimeout(done, 1)
        }, 160)
      })

      it('includes padding and borders from "px" units in height when CSS "box-sizing" is set to "content-box"', (done) => {
        setUp('content-box', 'px')

        // timeout needed because of requestAnimationFrame and must be more than window.postMessage in setUp
        setTimeout(() => {
          expect(iframe.offsetHeight).toBe(
            HEIGHT + extraHeights.reduce((a, b) => a + b, 0),
          )
          setTimeout(done, 1)
        }, 160)
      })
    })
  })
})
