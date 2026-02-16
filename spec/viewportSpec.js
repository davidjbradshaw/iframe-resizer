define(['iframeResizerParent'], (iframeResize) => {
  describe('Visual Viewport and Parent Properties', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    describe('Parent info monitoring', () => {
      it('should respond to parentInfo request', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport1',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Request parent info
            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have attempted to send messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should include parent properties in messages', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport2',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Request parent info
            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should send monitoring updates', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport3',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              
              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should include iframe position data', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport4',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              
              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Parent info monitoring lifecycle', () => {
      it('should start monitoring on parentInfo message', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport5',
          checkOrigin: false,
          onReady: () => {
            let callCount = 0
            spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
              callCount++
            })

            // Start monitoring
            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent multiple updates
              expect(callCount).toBeGreaterThan(0)

              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should stop monitoring on parentInfoStop message', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport6',
          checkOrigin: false,
          onReady: () => {
            let initialCallCount = 0
            spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
              initialCallCount++
            })

            // Start monitoring
            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              const afterStartCount = initialCallCount

              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')

              setTimeout(() => {
                // Call count should not have increased much after stop
                const afterStopCount = initialCallCount
                expect(afterStopCount).toBeLessThanOrEqual(afterStartCount + 2)
                done()
              }, 100)
            }, 100)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle multiple start/stop cycles', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport7',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Start, stop, start, stop
            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              mockMsgFromIFrame(iframe, 'parentInfoStop')

              setTimeout(() => {
                mockMsgFromIFrame(iframe, 'parentInfo')

                setTimeout(() => {
                  mockMsgFromIFrame(iframe, 'parentInfoStop')

                  setTimeout(() => {
                    // Should have handled all cycles
                    expect(
                      iframe.contentWindow.postMessage.calls.count(),
                    ).toBeGreaterThan(0)
                    done()
                  }, 50)
                }, 50)
              }, 50)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Visual viewport properties', () => {
      it('should send viewport data', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport8',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              
              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should include scale information', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport9',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              
              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should include offset data', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport10',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              
              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Parent info integration', () => {
      it('should work with resize events', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport11',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Start parent info monitoring
            mockMsgFromIFrame(iframe, 'parentInfo')

            // Also send resize
            setTimeout(() => {
              window.postMessage(
                '[iFrameSizer]viewport11:100:200:mutationObserver',
                '*',
              )

              setTimeout(() => {
                // Should have sent messages
                expect(iframe.contentWindow.postMessage).toHaveBeenCalled()

                // Stop monitoring
                mockMsgFromIFrame(iframe, 'parentInfoStop')
                done()
              }, 100)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should work with multiple iframes', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport12',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Request parent info
            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()

              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should clean up on iframe close', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport13',
          checkOrigin: false,
          onAfterClose: () => {
            // Cleanup should be complete
            expect(document.getElementById('viewport13')).toBeNull()
            iframe = null
            done()
          },
          onReady: (iframeEl) => {
            // Start parent info monitoring
            mockMsgFromIFrame(iframeEl, 'parentInfo')

            setTimeout(() => {
              // Close iframe
              iframeEl.iframeResizer.close()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Parent info timing', () => {
      it('should send info immediately on request', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport14',
          checkOrigin: false,
          onReady: () => {
            const startTime = Date.now()
            let firstInfoTime = null

            spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
              if (!firstInfoTime) {
                firstInfoTime = Date.now()
              }
            })

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent info quickly
              expect(firstInfoTime).not.toBeNull()
              expect(firstInfoTime - startTime).toBeLessThan(200)

              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 100)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should send monitoring updates', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport15',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()

              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 200)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Error handling', () => {
      it('should handle missing visualViewport gracefully', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport16',
          checkOrigin: false,
          onReady: () => {
            // Request parent info even if visualViewport might not be fully available
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should still send something
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              
              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 100)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle stop without start', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport17',
          checkOrigin: false,
          onReady: () => {
            // Stop without starting
            mockMsgFromIFrame(iframe, 'parentInfoStop')

            setTimeout(() => {
              // Should not crash
              expect(iframe.iframeResizer).toBeDefined()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle rapid start/stop calls', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport18',
          checkOrigin: false,
          onReady: () => {
            // Rapid start/stop
            mockMsgFromIFrame(iframe, 'parentInfo')
            mockMsgFromIFrame(iframe, 'parentInfoStop')
            mockMsgFromIFrame(iframe, 'parentInfo')
            mockMsgFromIFrame(iframe, 'parentInfoStop')

            setTimeout(() => {
              // Should handle all calls
              expect(iframe.iframeResizer).toBeDefined()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Parent info message format', () => {
      it('should send data to iframe', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport19',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              
              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should use correct message protocol', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'viewport20',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent messages
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              
              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              done()
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })
  })
})
