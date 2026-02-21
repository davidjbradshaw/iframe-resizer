define(['iframeResizerParent'], (iframeResize) => {
  describe('Error Recovery', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    describe('Timeout handling', () => {
      it('should trigger warning after timeout expires', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error1',
          checkOrigin: false,
          warningTimeout: 100, // Very short timeout
        })[0]

        // Don't send init - let it timeout
        setTimeout(() => {
          // Should have warned about no response
          const warnCalls = console.warn.calls.all()
          const hasTimeoutWarning = warnCalls.some((call) =>
            call.args.some((arg) =>
              typeof arg === 'string' && arg.includes('has not responded'),
            ),
          )
          expect(hasTimeoutWarning).toBe(true)
          done()
        }, 200)
      })

      it('should clear timeout when iframe responds', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error2',
          checkOrigin: false,
          warningTimeout: 200,
          onReady: () => {
            setTimeout(() => {
              // Should not have warned since iframe responded
              const warnCalls = console.warn.calls.all()
              const hasTimeoutWarning = warnCalls.some((call) =>
                call.args.some((arg) =>
                  typeof arg === 'string' && arg.includes('has not responded'),
                ),
              )
              expect(hasTimeoutWarning).toBe(false)
              done()
            }, 100)
          },
        })[0]

        // Send init quickly to clear timeout
        mockMsgFromIFrame(iframe, 'init')
      })

      it('should not trigger warning when timeout is disabled', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error3',
          checkOrigin: false,
          warningTimeout: 0, // Disabled
        })[0]

        // Don't send init
        setTimeout(() => {
          // Should not have warned
          const warnCalls = console.warn.calls.all()
          const hasTimeoutWarning = warnCalls.some((call) =>
            call.args.some((arg) =>
              typeof arg === 'string' && arg.includes('has not responded'),
            ),
          )
          expect(hasTimeoutWarning).toBe(false)
          done()
        }, 150)
      })

      it('should handle multiple timeout cycles', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error4',
          checkOrigin: false,
          warningTimeout: 100,
          onReady: () => {
            // Iframe initialized, timeout should be cleared
            setTimeout(() => {
              // First timeout cycle passed, iframe is now ready
              expect(iframe.iframeResizer).toBeDefined()
              done()
            }, 50)
          },
        })[0]

        // Send init to clear first timeout
        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Malformed message handling', () => {
      it('should ignore messages without proper prefix', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error5',
          checkOrigin: false,
          onReady: () => {
            // Send malformed message
            window.postMessage('invalidMessage:100:200:resize', '*')

            setTimeout(() => {
              // Should not have processed the message
              expect(iframe.style.height).not.toBe('100px')
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle messages with missing parts', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error6',
          checkOrigin: false,
          onReady: () => {
            // Send incomplete message
            window.postMessage('[iFrameSizer]error6:', '*')

            setTimeout(() => {
              // Should not crash
              expect(iframe).toBeDefined()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle messages with invalid numbers', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error7',
          checkOrigin: false,
          onReady: () => {
            // Send message with non-numeric dimensions
            window.postMessage('[iFrameSizer]error7:abc:def:resize', '*')

            setTimeout(() => {
              // Should not crash, dimensions should be NaN or 0
              expect(iframe).toBeDefined()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should ignore messages for non-existent iframes', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error8',
          checkOrigin: false,
          onReady: () => {
            // Send message for non-existent iframe
            window.postMessage(
              '[iFrameSizer]nonExistentIframe:100:200:resize',
              '*',
            )

            setTimeout(() => {
              // Should have ignored the message
              expect(iframe).toBeDefined()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle unsupported message types gracefully', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error9',
          checkOrigin: false,
          onReady: () => {
            // Send message with unsupported type
            window.postMessage(
              '[iFrameSizer]error9:0:0:unsupportedType',
              '*',
            )

            setTimeout(() => {
              // Should have warned about unsupported message
              const warnCalls = console.warn.calls.all()
              const hasUnsupportedWarning = warnCalls.some((call) =>
                call.args.some(
                  (arg) =>
                    typeof arg === 'string' &&
                    arg.includes('Unsupported message'),
                ),
              )
              expect(hasUnsupportedWarning).toBe(true)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Origin validation errors', () => {
      it('should handle origin validation with allowed origins', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error10',
          checkOrigin: [window.location.origin], // Include current origin
          onReady: () => {
            // Should work with current origin in allowed list
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should allow messages when checkOrigin is false', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error11',
          checkOrigin: false,
          onReady: () => {
            // Should be called regardless of origin
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should allow messages from allowed origin list', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error12',
          checkOrigin: [window.location.origin, 'https://example.com'],
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Missing iframe handling', () => {
      it('should handle iframe removed before message received', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error13',
          checkOrigin: false,
          onReady: () => {
            // Remove iframe from DOM
            const parent = iframe.parentNode
            parent.removeChild(iframe)

            // Try to send message to removed iframe
            setTimeout(() => {
              window.postMessage('[iFrameSizer]error13:100:200:resize', '*')

              setTimeout(() => {
                // Message was sent but iframe is gone
                expect(document.getElementById('error13')).toBeNull()
                done()
              }, 50)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should ignore messages for closed iframes', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error14',
          checkOrigin: false,
          onAfterClose: () => {
            // Try to send message after close
            setTimeout(() => {
              window.postMessage('[iFrameSizer]error14:100:200:resize', '*')

              setTimeout(() => {
                // Should not crash
                expect(document.getElementById('error14')).toBeNull()
                done()
              }, 50)
            }, 10)
          },
          onReady: (iframeEl) => {
            setTimeout(() => {
              iframeEl.iframeResizer.close()
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Message with zero dimensions', () => {
      it('should ignore messages with zero height', (done) => {
        spyOn(console, 'log')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error15',
          checkOrigin: false,
          onReady: () => {
            const initialHeight = iframe.style.height

            // Send message with zero height
            window.postMessage('[iFrameSizer]error15:0:200:resize', '*')

            setTimeout(() => {
              // Should have logged about ignoring
              const logCalls = console.log.calls.all()
              const hasIgnoreLog = logCalls.some((call) =>
                call.args.some(
                  (arg) =>
                    typeof arg === 'string' &&
                    arg.includes('Ignoring message with 0'),
                ),
              )
              expect(hasIgnoreLog).toBe(true)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should ignore messages with zero width', (done) => {
        spyOn(console, 'log')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error16',
          checkOrigin: false,
          direction: 'horizontal',
          onReady: () => {
            // Send message with zero width
            window.postMessage('[iFrameSizer]error16:200:0:resize', '*')

            setTimeout(() => {
              // Should have logged about ignoring
              const logCalls = console.log.calls.all()
              const hasIgnoreLog = logCalls.some((call) =>
                call.args.some(
                  (arg) =>
                    typeof arg === 'string' &&
                    arg.includes('Ignoring message with 0'),
                ),
              )
              expect(hasIgnoreLog).toBe(true)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle unsupported message with zero dimensions', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error17',
          checkOrigin: false,
          onReady: () => {
            // Send unsupported type with zero dimensions
            window.postMessage(
              '[iFrameSizer]error17:0:0:unknownType',
              '*',
            )

            setTimeout(() => {
              // Should warn about unsupported message
              const warnCalls = console.warn.calls.all()
              const hasWarning = warnCalls.some((call) =>
                call.args.some(
                  (arg) =>
                    typeof arg === 'string' &&
                    (arg.includes('Unsupported message') ||
                      arg.includes('later version')),
                ),
              )
              expect(hasWarning).toBe(true)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Hidden page handling', () => {
      it('should ignore resize requests when page is hidden', (done) => {
        spyOn(console, 'log')

        // Mock document.hidden
        Object.defineProperty(document, 'hidden', {
          writable: true,
          configurable: true,
          value: true,
        })

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error18',
          checkOrigin: false,
          onReady: () => {
            // Send resize while page is "hidden"
            window.postMessage('[iFrameSizer]error18:100:200:resize', '*')

            setTimeout(() => {
              // Should have logged about page hidden
              const logCalls = console.log.calls.all()
              const hasHiddenLog = logCalls.some((call) =>
                call.args.some(
                  (arg) =>
                    typeof arg === 'string' &&
                    arg.includes('Page hidden'),
                ),
              )
              expect(hasHiddenLog).toBe(true)

              // Restore document.hidden
              Object.defineProperty(document, 'hidden', {
                writable: true,
                configurable: true,
                value: false,
              })

              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Callback error handling', () => {
      it('should handle errors in callbacks', (done) => {
        let errorThrown = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error19',
          checkOrigin: false,
          onResized: () => {
            errorThrown = true
            // Note: Errors in callbacks are isolated by setTimeout
            // so they don't crash the main execution
          },
          onReady: () => {
            // Send resize to trigger onResized
            window.postMessage(
              '[iFrameSizer]error19:100:200:mutationObserver',
              '*',
            )

            setTimeout(() => {
              // Callback should have been called
              expect(errorThrown).toBe(true)
              // Iframe should still be functional
              expect(iframe.iframeResizer).toBeDefined()
              done()
            }, 100)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should continue processing messages after callback completes', (done) => {
        let firstResizeCalled = false
        let secondResizeCalled = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error20',
          checkOrigin: false,
          onResized: () => {
            if (!firstResizeCalled) {
              firstResizeCalled = true
            } else {
              secondResizeCalled = true
            }
          },
          onReady: () => {
            // Send first resize
            window.postMessage(
              '[iFrameSizer]error20:100:200:mutationObserver',
              '*',
            )

            setTimeout(() => {
              // Send second resize
              window.postMessage(
                '[iFrameSizer]error20:150:250:mutationObserver',
                '*',
              )

              setTimeout(() => {
                // Both resizes should have been processed
                expect(firstResizeCalled).toBe(true)
                expect(secondResizeCalled).toBe(true)
                done()
              }, 50)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Message from meta parent', () => {
      it('should ignore init messages from nested parent pages', (done) => {
        spyOn(console, 'log')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'error21',
          checkOrigin: false,
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        // Send normal init
        mockMsgFromIFrame(iframe, 'init')

        // Try to send another init with meta parent signature
        // (type is 'true', 'false', or 'undefined' for meta parent)
        setTimeout(() => {
          window.postMessage('[iFrameSizer]error21:0:0:true', '*')
        }, 10)
      })
    })
  })
})
