define(['iframeResizerParent'], (iframeResize) => {
  describe('Edge Cases', () => {
    let iframe
    let additionalIframes = []

    beforeEach(() => {
      loadIFrame('iframe600.html')
      additionalIframes = []
    })

    afterEach(() => {
      // Clean up all additional iframes first
      additionalIframes.forEach((frame) => {
        if (frame && frame.parentNode) {
          frame.parentNode.removeChild(frame)
        }
        tearDown(frame)
      })
      additionalIframes = []
      
      // Then clean up main iframe
      tearDown(iframe)
    })

    describe('Disconnected iframes', () => {
      it('should handle iframe not yet connected to DOM', (done) => {
        // Create an iframe element but don't add it to the DOM yet
        const disconnectedIframe = document.createElement('iframe')
        disconnectedIframe.src = 'spec/resources/frame.content.html'
        disconnectedIframe.id = 'edge1'

        // Initialize iframe-resizer on disconnected iframe
        const iframes = iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          onReady: () => {
            // Should be called after iframe is added to DOM
            expect(disconnectedIframe.isConnected).toBe(true)
            expect(disconnectedIframe.iframeResizer).toBeDefined()
            done()
          },
        }, disconnectedIframe)

        // Verify iframe is in returned array
        expect(iframes.length).toBe(1)
        expect(iframes[0]).toBe(disconnectedIframe)

        // Add iframe to DOM after a short delay
        setTimeout(() => {
          document.body.appendChild(disconnectedIframe)
          // Send init message after adding to DOM with more delay
          setTimeout(() => {
            mockMsgFromIFrame(disconnectedIframe, 'init')
          }, 50)
        }, 100)

        iframe = disconnectedIframe
        additionalIframes.push(disconnectedIframe)
      })

      it('should observe DOM and initialize when iframe is added', (done) => {
        const disconnectedIframe = document.createElement('iframe')
        disconnectedIframe.src = 'spec/resources/frame.content.html'
        disconnectedIframe.id = 'edge2'

        let readyCalled = false

        iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          onReady: () => {
            readyCalled = true
            expect(disconnectedIframe.isConnected).toBe(true)
            done()
          },
        }, disconnectedIframe)

        // Verify onReady hasn't been called yet
        expect(readyCalled).toBe(false)

        // Add to DOM with longer delay
        setTimeout(() => {
          document.body.appendChild(disconnectedIframe)
          setTimeout(() => {
            mockMsgFromIFrame(disconnectedIframe, 'init')
          }, 50)
        }, 100)

        iframe = disconnectedIframe
        additionalIframes.push(disconnectedIframe)
      })
    })

    describe('Multiple iframes', () => {
      it('should handle multiple iframes with same configuration', (done) => {
        loadIFrame('twoIFrame600WithId.html')

        let readyCount = 0
        const iframes = iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          onReady: () => {
            readyCount++
            if (readyCount === 2) {
              expect(iframes.length).toBe(2)
              expect(iframes[0].iframeResizer).toBeDefined()
              expect(iframes[1].iframeResizer).toBeDefined()
              done()
            }
          },
        })

        // Mock init for both iframes
        mockMsgFromIFrame(iframes[0], 'init')
        mockMsgFromIFrame(iframes[1], 'init')

        iframe = iframes[0] // For cleanup
        additionalIframes.push(iframes[1])
      })

      it('should handle multiple iframes with different configurations', (done) => {
        loadIFrame('twoIFrame600WithId.html')

        const frame1Ready = { ready: false }
        const frame2Ready = { ready: false }

        const checkBothReady = () => {
          if (frame1Ready.ready && frame2Ready.ready) {
            expect(iframe1.iframeResizer).toBeDefined()
            expect(iframe2.iframeResizer).toBeDefined()
            done()
          }
        }

        const iframe1 = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge3a',
          checkOrigin: false,
          direction: 'vertical',
          onReady: () => {
            frame1Ready.ready = true
            checkBothReady()
          },
        }, document.querySelectorAll('iframe')[0])[0]

        const iframe2 = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge3b',
          checkOrigin: false,
          direction: 'horizontal',
          onReady: () => {
            frame2Ready.ready = true
            checkBothReady()
          },
        }, document.querySelectorAll('iframe')[1])[0]

        mockMsgFromIFrame(iframe1, 'init')
        mockMsgFromIFrame(iframe2, 'init')

        iframe = iframe1 // For cleanup
        additionalIframes.push(iframe2)
      })

      it('should isolate iframe instances', (done) => {
        loadIFrame('twoIFrame600WithId.html')

        let resizeCount1 = 0
        let resizeCount2 = 0

        const iframes = iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          onResized: (data) => {
            if (data.iframe.id === iframes[0].id) resizeCount1++
            if (data.iframe.id === iframes[1].id) resizeCount2++

            if (resizeCount1 > 0 && resizeCount2 > 0) {
              // Both iframes should have received their own resize events
              expect(resizeCount1).toBeGreaterThan(0)
              expect(resizeCount2).toBeGreaterThan(0)
              done()
            }
          },
        })

        mockMsgFromIFrame(iframes[0], 'init')
        mockMsgFromIFrame(iframes[1], 'init')

        // Send different resize messages to each iframe with more delay
        setTimeout(() => {
          window.postMessage(
            `[iFrameSizer]${iframes[0].id}:100:200:mutationObserver`,
            '*',
          )
          window.postMessage(
            `[iFrameSizer]${iframes[1].id}:150:250:mutationObserver`,
            '*',
          )
        }, 100)

        iframe = iframes[0] // For cleanup
        additionalIframes.push(iframes[1])
      })
    })

    describe('DOM manipulation', () => {
      it('should handle iframe removal from DOM', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge4',
          checkOrigin: false,
          onReady: (iframeEl) => {
            expect(iframeEl.iframeResizer).toBeDefined()
            
            // Manually remove iframe from DOM
            setTimeout(() => {
              const parent = iframeEl.parentNode
              parent.removeChild(iframeEl)
              
              // Verify iframe is no longer in DOM with longer delay
              setTimeout(() => {
                expect(document.getElementById('edge4')).toBeNull()
                done()
              }, 100)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle close and cleanup properly', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge5',
          checkOrigin: false,
          onAfterClose: () => {
            // Verify iframe is removed
            expect(document.getElementById('edge5')).toBeNull()
            done()
          },
          onReady: (iframeEl) => {
            setTimeout(() => {
              iframeEl.iframeResizer.close()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle re-initialization attempt', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge6',
          checkOrigin: false,
          onReady: () => {
            // Try to re-initialize the same iframe
            iframeResize({
              license: 'GPLv3',
              log: true,
              checkOrigin: false,
            }, iframe)

            setTimeout(() => {
              // Should have warned about already setup
              expect(console.warn).toHaveBeenCalled()
              done()
            }, 100)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Origin checking', () => {
      it('should work with checkOrigin: false', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge7',
          checkOrigin: false,
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should work with checkOrigin: true (same origin)', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge8',
          checkOrigin: true,
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        // For same-origin, init message should work
        mockMsgFromIFrame(iframe, 'init')
      })

      it('should work with checkOrigin as array of allowed origins', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge9',
          checkOrigin: ['http://localhost:9876', window.location.origin],
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle sameDomain option', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge10',
          checkOrigin: false,
          sameDomain: true,
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('License validation', () => {
      it('should accept GPLv3 license', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge11',
          checkOrigin: false,
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should work without license in test environment', (done) => {
        iframe = iframeResize({
          log: true,
          id: 'edge12',
          checkOrigin: false,
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should accept commercial license key format', (done) => {
        iframe = iframeResize({
          license: 'commercial-key-12345',
          log: true,
          id: 'edge13',
          checkOrigin: false,
          onReady: () => {
            expect(iframe.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Selector edge cases', () => {
      it('should handle empty selector returning no iframes', () => {
        const iframes = iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
        }, '.non-existent-class')

        expect(iframes.length).toBe(0)
      })

      it('should handle undefined selector (defaults to all iframes)', (done) => {
        const iframes = iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          onReady: () => {
            expect(iframes.length).toBeGreaterThan(0)
            done()
          },
        })

        // Should find the iframe loaded in beforeEach
        expect(iframes.length).toBeGreaterThan(0)
        
        mockMsgFromIFrame(iframes[0], 'init')
        iframe = iframes[0]
        // Track any additional iframes beyond the first one
        for (let i = 1; i < iframes.length; i++) {
          additionalIframes.push(iframes[i])
        }
      })

      it('should handle specific ID selector', (done) => {
        iframe = document.getElementsByTagName('iframe')[0]
        iframe.id = 'edge14'

        const iframes = iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          onReady: () => {
            expect(iframes.length).toBe(1)
            expect(iframes[0].id).toBe('edge14')
            done()
          },
        }, '#edge14')

        mockMsgFromIFrame(iframes[0], 'init')
      })
    })

    describe('Error handling edge cases', () => {
      it('should handle invalid target type', () => {
        expect(() => {
          iframeResize({
            license: 'GPLv3',
            log: true,
            checkOrigin: false,
          }, 123)
        }).toThrow()
      })

      it('should handle non-iframe element', () => {
        const divElement = document.createElement('div')
        
        expect(() => {
          iframeResize({
            license: 'GPLv3',
            log: true,
            checkOrigin: false,
          }, divElement)
        }).toThrow()
      })

      it('should handle null target', () => {
        expect(() => {
          iframeResize({
            license: 'GPLv3',
            log: true,
            checkOrigin: false,
          }, null)
        }).toThrow()
      })
    })

    describe('Timing edge cases', () => {
      it('should handle rapid successive resize events', (done) => {
        let resizeCount = 0

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge15',
          checkOrigin: false,
          onResized: () => {
            resizeCount++
          },
          onReady: () => {
            // Send multiple resize messages rapidly
            for (let i = 0; i < 5; i++) {
              window.postMessage(
                `[iFrameSizer]edge15:${100 + i * 10}:200:mutationObserver`,
                '*',
              )
            }

            setTimeout(() => {
              // Should have handled resizes (may be throttled)
              expect(resizeCount).toBeGreaterThan(0)
              done()
            }, 200)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle messages before iframe is ready', (done) => {
        // Don't send init yet
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'edge16',
          checkOrigin: false,
          onReady: () => {
            // Should only be called after init
            done()
          },
        })[0]

        // Try to send resize before init
        window.postMessage('[iFrameSizer]edge16:100:200:mutationObserver', '*')

        // Now send init with more delay
        setTimeout(() => {
          mockMsgFromIFrame(iframe, 'init')
        }, 100)
      })
    })

    describe('ID generation edge cases', () => {
      it('should generate ID for iframe without ID', (done) => {
        const iframeEl = document.getElementsByTagName('iframe')[0]
        iframeEl.removeAttribute('id')

        const iframes = iframeResize({
          license: 'GPLv3',
          log: true,
          checkOrigin: false,
          onReady: (iframeWithId) => {
            // Should have auto-generated ID
            expect(iframeWithId.id).toBeTruthy()
            expect(iframeWithId.id).toContain('iFrameResizer')
            done()
          },
        }, iframeEl)

        iframe = iframes[0]
        mockMsgFromIFrame(iframe, 'init')
      })

      it('should preserve custom ID when provided', (done) => {
        const customId = 'myCustomIframeId'
        
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: customId,
          checkOrigin: false,
          onReady: (iframeWithId) => {
            expect(iframeWithId.id).toContain(customId)
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })
  })
})
