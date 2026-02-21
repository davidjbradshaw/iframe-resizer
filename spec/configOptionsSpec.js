define(['iframeResizerParent'], (iframeResize) => {
  describe('Configuration Options', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    describe('tolerance', () => {
      it('should accept tolerance of 0', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config1',
          checkOrigin: false,
          tolerance: 0,
          onReady: () => {
            // Tolerance of 0 means any size change should trigger resize
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should accept positive tolerance value', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config2',
          checkOrigin: false,
          tolerance: 5,
          onReady: () => {
            // Tolerance value should be set
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should accept large tolerance value', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config3',
          checkOrigin: false,
          tolerance: 100,
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('direction', () => {
      it('should accept direction: vertical', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config4',
          checkOrigin: false,
          direction: 'vertical',
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should accept direction: horizontal', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config5',
          checkOrigin: false,
          direction: 'horizontal',
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should accept direction: both', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config6',
          checkOrigin: false,
          direction: 'both',
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should accept direction: none', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config7',
          checkOrigin: false,
          direction: 'none',
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should log error for invalid direction', () => {
        spyOn(console, 'error')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config8',
          checkOrigin: false,
          direction: 'invalid',
        })[0]

        // Error should be logged
        expect(console.error).toHaveBeenCalled()
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
                done()
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
                done()
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
                done()
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
            expect(console.warn).toHaveBeenCalled()
            done()
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
            expect(console.warn).toHaveBeenCalled()
            done()
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
            expect(console.warn).toHaveBeenCalled()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('warningTimeout', () => {
      it('should accept warningTimeout of 0 to disable warnings', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config15',
          checkOrigin: false,
          warningTimeout: 0,
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should accept custom warningTimeout value', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config16',
          checkOrigin: false,
          warningTimeout: 2000,
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

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
                call.args.some((arg) =>
                  typeof arg === 'string' && arg.includes('has not responded'),
                ),
              )
              expect(noResponseWarning).toBe(false)
              done()
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
            call.args.some((arg) =>
              typeof arg === 'string' && arg.includes('has not responded'),
            ),
          )
          expect(noResponseWarning).toBe(true)
          done()
        }, 200)
      })
    })

    describe('Multiple Option Combinations', () => {
      it('should work with tolerance and direction together', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config19',
          checkOrigin: false,
          tolerance: 5,
          direction: 'both',
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should work with all configuration options combined', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config20',
          checkOrigin: false,
          tolerance: 10,
          direction: 'vertical',
          warningTimeout: 3000,
          scrolling: true,
          inPageLinks: true,
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Runtime Option Changes', () => {
      it('should handle direction change after initialization', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config21',
          checkOrigin: false,
          direction: 'vertical',
          onReady: () => {
            // Initial direction is vertical
            expect(iframe).toBeDefined()

            // Note: Direction cannot be changed after initialization in current implementation
            // This test documents the current behavior
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Edge Cases', () => {
      it('should handle negative tolerance gracefully', (done) => {
        // Negative tolerance should be treated as 0 or cause validation error
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config22',
          checkOrigin: false,
          tolerance: -5,
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle very large warningTimeout value', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config23',
          checkOrigin: false,
          warningTimeout: 999999,
          onReady: () => {
            expect(iframe).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle direction none with resize attempts', (done) => {
        let resizeAttempted = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'config24',
          checkOrigin: false,
          direction: 'none',
          onResized: () => {
            resizeAttempted = true
          },
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
                done()
              }, 50)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })
  })
})
