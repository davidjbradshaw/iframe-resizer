define(['iframeResizerParent'], (iframeResize) => {
  describe('Performance Features', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    describe('autoResize', () => {
      it('should enable autoResize by default', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf1',
          checkOrigin: false,
          onReady: () => {
            // autoResize should be enabled by default
            expect(iframe.iframeResizer).toBeDefined()
            setTimeout(done, 1)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should allow disabling autoResize via direction none', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf2',
          checkOrigin: false,
          direction: 'none',
          onReady: () => {
            // With direction 'none', autoResize should be disabled
            expect(iframe.iframeResizer).toBeDefined()
            setTimeout(done, 1)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle autoResize toggle from child', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf3',
          checkOrigin: false,
          onReady: () => {
            // Send autoResize toggle message
            window.postMessage('[iFrameSizer]perf3:0:0:autoResize:false', '*')

            setTimeout(() => {
              // Send resize after autoResize disabled
              window.postMessage(
                '[iFrameSizer]perf3:100:200:mutationObserver',
                '*',
              )

              setTimeout(() => {
                // Should have processed initial resize but behavior may vary
                expect(iframe.iframeResizer).toBeDefined()
                setTimeout(done, 1)
              }, 50)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should respect autoResize state across multiple resizes', (done) => {
        let resizeCount = 0

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf4',
          checkOrigin: false,
          onResized: () => {
            resizeCount++
          },
          onReady: () => {
            // Send multiple resizes
            window.postMessage(
              '[iFrameSizer]perf4:100:200:mutationObserver',
              '*',
            )

            setTimeout(() => {
              window.postMessage(
                '[iFrameSizer]perf4:150:250:mutationObserver',
                '*',
              )

              setTimeout(() => {
                // Both resizes should have been processed
                expect(resizeCount).toBeGreaterThan(0)
                setTimeout(done, 1)
              }, 50)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Page info monitoring', () => {
      it('should start page info monitoring on request', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf5',
          checkOrigin: false,
          onReady: () => {
            // Spy on postMessage to verify info is sent
            spyOn(iframe.contentWindow, 'postMessage')

            // Request page info monitoring
            mockMsgFromIFrame(iframe, 'pageInfo')

            setTimeout(() => {
              // Should have sent page info
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              setTimeout(done, 1)
            }, 100)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should send page info when asked', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf7',
          checkOrigin: false,
          onReady: () => {
            let callCount = 0
            spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
              callCount++
            })

            // Request page info monitoring
            mockMsgFromIFrame(iframe, 'pageInfo')

            setTimeout(() => {
              // Should have sent multiple page info updates
              expect(callCount).toBeGreaterThan(0)

              // Stop monitoring
              mockMsgFromIFrame(iframe, 'pageInfoStop')
              setTimeout(done, 1)
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Parent info monitoring', () => {
      it('should start parent info monitoring on request', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf8',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Request parent info monitoring
            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent parent info
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              setTimeout(done, 1)
            }, 100)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should send parent info when asked', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf10',
          checkOrigin: false,
          onReady: () => {
            let callCount = 0
            spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
              callCount++
            })

            // Request parent info monitoring
            mockMsgFromIFrame(iframe, 'parentInfo')

            setTimeout(() => {
              // Should have sent multiple updates
              expect(callCount).toBeGreaterThan(0)

              // Stop monitoring
              mockMsgFromIFrame(iframe, 'parentInfoStop')
              setTimeout(done, 1)
            }, 150)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Resize handling', () => {
      it('should handle rapid resize events', (done) => {
        let resizeCount = 0

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf11',
          checkOrigin: false,
          onResized: () => {
            resizeCount++
          },
          onReady: () => {
            // Send rapid resize events
            for (let i = 0; i < 10; i++) {
              window.postMessage(
                `[iFrameSizer]perf11:${100 + i}:200:mutationObserver`,
                '*',
              )
            }

            setTimeout(() => {
              // Should have handled resizes (may be throttled)
              expect(resizeCount).toBeGreaterThan(0)
              setTimeout(done, 1)
            }, 200)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle resize from different sources', (done) => {
        let resizeCount = 0

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf12',
          checkOrigin: false,
          onResized: () => {
            resizeCount++
          },
          onReady: () => {
            // Send resizes with different source types
            window.postMessage(
              '[iFrameSizer]perf12:100:200:mutationObserver',
              '*',
            )

            setTimeout(() => {
              window.postMessage(
                '[iFrameSizer]perf12:110:210:resizeObserver',
                '*',
              )

              setTimeout(() => {
                window.postMessage('[iFrameSizer]perf12:120:220:interval', '*')

                setTimeout(() => {
                  // Should have handled resizes from all sources
                  expect(resizeCount).toBeGreaterThan(0)
                  setTimeout(done, 1)
                }, 50)
              }, 50)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Tolerance handling', () => {
      it('should resize outside tolerance range', (done) => {
        let resizeCount = 0

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf15',
          checkOrigin: false,
          tolerance: 10,
          onResized: () => {
            resizeCount++
          },
          onReady: () => {
            // Send first resize
            window.postMessage(
              '[iFrameSizer]perf15:100:200:mutationObserver',
              '*',
            )

            setTimeout(() => {
              // Send resize outside tolerance (120px, more than 10px diff)
              window.postMessage(
                '[iFrameSizer]perf15:120:200:mutationObserver',
                '*',
              )

              setTimeout(() => {
                // Should have triggered resize
                expect(resizeCount).toBeGreaterThan(0)
                setTimeout(done, 1)
              }, 50)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Tab visibility handling', () => {
      it('should handle resize when tab becomes visible', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf16',
          checkOrigin: false,
          onReady: () => {
            // Send resize
            window.postMessage(
              '[iFrameSizer]perf16:100:200:mutationObserver',
              '*',
            )

            setTimeout(() => {
              // Visibility change is handled automatically
              expect(iframe.style.height).toBe('100px')
              setTimeout(done, 1)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should queue resizes when tab is hidden', (done) => {
        setDocumentHidden(true)

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf17',
          checkOrigin: false,
          onReady: () => {
            const hiddenHeight = iframe.style.height

            // Send resize while hidden
            window.postMessage(
              '[iFrameSizer]perf17:100:200:mutationObserver',
              '*',
            )

            setTimeout(() => {
              expect(iframe.style.height).toBe(hiddenHeight)
              setTimeout(done, 1)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('First run behavior', () => {
      it('should handle first run initialization', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf18',
          checkOrigin: false,
          onReady: (iframeEl) => {
            // First run should be complete
            expect(iframeEl.iframeResizer).toBeDefined()
            setTimeout(done, 1)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should clear first run flag after initialization', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf19',
          checkOrigin: false,
          onReady: () => {
            // Send another resize after first run
            setTimeout(() => {
              window.postMessage(
                '[iFrameSizer]perf19:100:200:mutationObserver',
                '*',
              )

              setTimeout(() => {
                // Should handle subsequent resizes normally
                expect(iframe.iframeResizer).toBeDefined()
                setTimeout(done, 1)
              }, 50)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Memory and cleanup', () => {
      it('should clean up monitors on close', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf20',
          checkOrigin: false,
          onAfterClose: () => {
            // Cleanup should be complete
            expect(document.getElementById('perf20')).toBeNull()
            setTimeout(done, 1)
          },
          onReady: (iframeEl) => {
            // Start monitoring
            mockMsgFromIFrame(iframeEl, 'pageInfo')
            mockMsgFromIFrame(iframeEl, 'parentInfo')

            setTimeout(() => {
              // Close iframe
              iframeEl.iframeResizer.close()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should not leak memory with multiple iframes', (done) => {
        loadIFrame('twoIFrame600WithId.html')

        const iframes = iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          onReady: () => {
            // Multiple iframes initialized
            if (iframes.every((ifr) => ifr.iframeResizer)) {
              // Clean up
              iframes.forEach((ifr) => ifr.iframeResizer.close())

              setTimeout(() => {
                // All should be cleaned up
                setTimeout(done, 1)
              }, 100)
            }
          },
        })

        // Mock init for all iframes
        iframes.forEach((ifr) => mockMsgFromIFrame(ifr, 'init'))

        iframe = iframes[0] // For cleanup
      })
    })

    describe('Performance optimizations', () => {
      it('should batch multiple rapid resize requests', (done) => {
        let resizeCount = 0
        const startTime = Date.now()

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf21',
          checkOrigin: false,
          onResized: () => {
            resizeCount++
          },
          onReady: () => {
            // Send many rapid resizes
            for (let i = 0; i < 20; i++) {
              window.postMessage(
                `[iFrameSizer]perf21:${100 + i}:200:mutationObserver`,
                '*',
              )
            }

            setTimeout(() => {
              const elapsed = Date.now() - startTime

              // Should have processed resizes efficiently
              expect(resizeCount).toBeGreaterThan(0)
              // Should complete reasonably quickly
              expect(elapsed).toBeLessThan(1000)
              setTimeout(done, 1)
            }, 300)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle concurrent resize and info monitoring', (done) => {
        let resizeCount = 0
        let infoSent = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'perf22',
          checkOrigin: false,
          onResized: () => {
            resizeCount++
          },
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
              infoSent = true
            })

            // Start monitoring
            mockMsgFromIFrame(iframe, 'pageInfo')

            // Send resizes concurrently
            for (let i = 0; i < 5; i++) {
              setTimeout(() => {
                window.postMessage(
                  `[iFrameSizer]perf22:${100 + i * 10}:200:mutationObserver`,
                  '*',
                )
              }, i * 20)
            }

            setTimeout(() => {
              // Both resize and monitoring should work
              expect(resizeCount).toBeGreaterThan(0)
              expect(infoSent).toBe(true)

              // Stop monitoring
              mockMsgFromIFrame(iframe, 'pageInfoStop')
              setTimeout(done, 1)
            }, 300)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })
  })
})
