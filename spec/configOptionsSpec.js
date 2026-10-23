define(['iframeResizerParent'], (iframeResize) => {
  describe('Configuration Options', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    describe('direction', () => {
      it('should log error for invalid direction', () => {
        spyOn(console, 'error')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config8',
          checkOrigin: false,
          direction: 'invalid',
        })[0]

        expect(console.error).toHaveBeenCalled()
        expect(String(console.error.calls.mostRecent().args)).toContain(
          'Direction value of "invalid" is not valid',
        )
      })

      it('should resize height when direction is vertical', (done) => {
        let resized = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config9',
          checkOrigin: false,
          direction: 'vertical',
          onResized: () => {
            resized = true
          },
          onReady: () => {
            setTimeout(() => {
              // Send a resize message
              window.postMessage(
                '[iFrameSizer]config9:150:200:mutationObserver',
                '*',
              )

              setTimeout(() => {
                expect(resized).toBe(true)
                // Height should be set
                expect(iframe.style.height).toBe('150px')
                setTimeout(done, 1)
              }, 50)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should resize width when direction is horizontal', (done) => {
        let resized = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config10',
          checkOrigin: false,
          direction: 'horizontal',
          onResized: () => {
            resized = true
          },
          onReady: () => {
            setTimeout(() => {
              // Send a resize message
              window.postMessage(
                '[iFrameSizer]config10:150:300:mutationObserver',
                '*',
              )

              setTimeout(() => {
                expect(resized).toBe(true)
                // Width should be set, height should not
                expect(iframe.style.width).toBe('300px')
                setTimeout(done, 1)
              }, 50)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should resize both dimensions when direction is both', (done) => {
        let resized = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config11',
          checkOrigin: false,
          direction: 'both',
          onResized: () => {
            resized = true
          },
          onReady: () => {
            setTimeout(() => {
              // Send a resize message
              window.postMessage(
                '[iFrameSizer]config11:200:400:mutationObserver',
                '*',
              )

              setTimeout(() => {
                expect(resized).toBe(true)
                // Both dimensions should be set
                expect(iframe.style.height).toBe('200px')
                expect(iframe.style.width).toBe('400px')
                setTimeout(done, 1)
              }, 50)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('sizeWidth and sizeHeight (deprecated)', () => {
      it('should warn when using deprecated sizeWidth option', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config12',
          checkOrigin: false,
          sizeWidth: true,
          onReady: () => {
            expect(adviceGiven(console.warn)).toContain(
              'options have been replaced with new',
            )
            setTimeout(done, 1)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should warn when using deprecated sizeHeight option', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config13',
          checkOrigin: false,
          sizeHeight: true,
          onReady: () => {
            expect(adviceGiven(console.warn)).toContain(
              'options have been replaced with new',
            )
            setTimeout(done, 1)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should warn when using both deprecated options', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config14',
          checkOrigin: false,
          sizeWidth: true,
          sizeHeight: false,
          onReady: () => {
            expect(adviceGiven(console.warn)).toContain(
              'options have been replaced with new',
            )
            setTimeout(done, 1)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('warningTimeout', () => {
      it('should not show warning when iframe responds before timeout', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config17',
          checkOrigin: false,
          warningTimeout: 1000,
          onReady: () => {
            setTimeout(() => {
              // Should not have warned since iframe responded
              const warnCalls = console.warn.calls.all()
              const noResponseWarning = warnCalls.some((call) =>
                call.args.some(
                  (arg) =>
                    typeof arg === 'string' &&
                    arg.includes('has not responded'),
                ),
              )

              expect(noResponseWarning).toBe(false)
              setTimeout(done, 1)
            }, 100)
          },
        })[0]

        // Immediately respond so timeout doesn't trigger
        mockMsgFromIFrame(iframe, 'init')
      })

      it('should show warning when iframe does not respond within timeout', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config18',
          checkOrigin: false,
          warningTimeout: 100, // Very short timeout
        })[0]

        // Don't send init message - let it timeout
        setTimeout(() => {
          // Should have warned about no response
          const warnCalls = console.warn.calls.all()
          const noResponseWarning = warnCalls.some((call) =>
            call.args.some(
              (arg) =>
                typeof arg === 'string' && arg.includes('has not responded'),
            ),
          )

          expect(noResponseWarning).toBe(true)
          setTimeout(done, 1)
        }, 200)
      })
    })

    describe('Edge Cases', () => {
      it('should handle direction none with resize attempts', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config24',
          checkOrigin: false,
          direction: 'none',
          onReady: () => {
            setTimeout(() => {
              // Send a resize message
              window.postMessage(
                '[iFrameSizer]config24:200:300:mutationObserver',
                '*',
              )

              setTimeout(() => {
                // With direction 'none', resize should not occur
                // But onResized might still be called - verify actual size change
                const hasHeight = iframe.style.height !== ''
                const hasWidth = iframe.style.width !== ''

                // With direction 'none', dimensions should not be set
                expect(hasHeight || hasWidth).toBe(false)
                setTimeout(done, 1)
              }, 50)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })
  })
})
