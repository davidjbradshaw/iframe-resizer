define(['iframeResizerParent'], (iframeResize) => {
  describe('Lifecycle Events', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    describe('onReady', () => {
      it('should call onReady when iframe initializes', (done) => {
        let readyCalled = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle1',
          checkOrigin: false,
          onReady: (iframeEl) => {
            readyCalled = true
            expect(iframeEl).toBe(iframe)
            expect(iframeEl.iframeResizer).toBeDefined()
            done()
          },
        })[0]

        // Mock the init message from child
        mockMsgFromIFrame(iframe, 'init')
      })

      it('should have iframe methods available in onReady', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle2',
          checkOrigin: false,
          onReady: (iframeEl) => {
            expect(iframeEl.iframeResizer.resize).toBeDefined()
            expect(iframeEl.iframeResizer.sendMessage).toBeDefined()
            expect(iframeEl.iframeResizer.close).toBeDefined()
            expect(iframeEl.iframeResizer.moveToAnchor).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should call onReady after initialization is complete', (done) => {
        let initComplete = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle3',
          checkOrigin: false,
          onReady: (iframeEl) => {
            // Check that the iframe has been initialized
            expect(initComplete).toBe(true)
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
        initComplete = true
      })
    })

    describe('onInit (deprecated)', () => {
      it('should call onInit when provided (deprecated behavior)', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle4',
          checkOrigin: false,
          onInit: (iframeEl) => {
            expect(iframeEl).toBe(iframe)
            // Should show deprecation warning
            expect(console.warn).toHaveBeenCalled()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('onBeforeClose', () => {
      it('should call onBeforeClose before removing iframe', (done) => {
        let beforeCloseCalled = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle5',
          checkOrigin: false,
          onBeforeClose: (id) => {
            beforeCloseCalled = true
            expect(id).toBe('lifecycle5')
            expect(document.getElementById('lifecycle5')).toBeTruthy()
            return true
          },
          onAfterClose: () => {
            expect(beforeCloseCalled).toBe(true)
            done()
          },
          onReady: (iframeEl) => {
            setTimeout(() => {
              iframeEl.iframeResizer.close()
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should cancel close when onBeforeClose returns false', (done) => {
        let afterCloseCalled = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle6',
          checkOrigin: false,
          onBeforeClose: () => {
            return false // Cancel the close
          },
          onAfterClose: () => {
            afterCloseCalled = true
          },
          onReady: (iframeEl) => {
            iframeEl.iframeResizer.close()

            setTimeout(() => {
              // Iframe should still exist
              expect(document.getElementById('lifecycle6')).toBeTruthy()
              expect(afterCloseCalled).toBe(false)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('onAfterClose', () => {
      it('should call onAfterClose after iframe is removed', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle7',
          checkOrigin: false,
          onAfterClose: (id) => {
            expect(id).toBe('lifecycle7')
            // Iframe should be removed from DOM
            expect(document.getElementById('lifecycle7')).toBeFalsy()
            done()
          },
          onReady: (iframeEl) => {
            setTimeout(() => {
              iframeEl.iframeResizer.close()
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should call onAfterClose when closed via message', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle8',
          checkOrigin: false,
          onAfterClose: () => {
            done()
          },
          onReady: () => {
            setTimeout(() => {
              mockMsgFromIFrame(iframe, 'close')
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('onMouseEnter', () => {
      it('should call onMouseEnter when mouse enters iframe', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle9',
          checkOrigin: false,
          mouseEvents: true,
          onMouseEnter: (event) => {
            expect(event.iframe).toBe(iframe)
            expect(event.type).toBe('mouseenter')
            expect(event.screenX).toBeDefined()
            expect(event.screenY).toBeDefined()
            done()
          },
          onReady: () => {
            setTimeout(() => {
              // Mock mouseenter message with coordinates
              mockMsgFromIFrame(iframe, 'mouseenter')
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should provide mouse coordinates in onMouseEnter', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle10',
          checkOrigin: false,
          mouseEvents: true,
          onMouseEnter: (event) => {
            expect(typeof event.screenX).toBe('number')
            expect(typeof event.screenY).toBe('number')
            done()
          },
          onReady: () => {
            setTimeout(() => {
              // Send mouseenter with specific coordinates
              window.postMessage(
                '[iFrameSizer]lifecycle10:100:150:mouseenter',
                '*',
              )
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('onMouseLeave', () => {
      it('should call onMouseLeave when mouse leaves iframe', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle11',
          checkOrigin: false,
          mouseEvents: true,
          onMouseLeave: (event) => {
            expect(event.iframe).toBe(iframe)
            expect(event.type).toBe('mouseleave')
            expect(event.screenX).toBeDefined()
            expect(event.screenY).toBeDefined()
            done()
          },
          onReady: () => {
            setTimeout(() => {
              // Mock mouseleave message
              mockMsgFromIFrame(iframe, 'mouseleave')
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should provide mouse coordinates in onMouseLeave', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle12',
          checkOrigin: false,
          mouseEvents: true,
          onMouseLeave: (event) => {
            expect(typeof event.screenX).toBe('number')
            expect(typeof event.screenY).toBe('number')
            done()
          },
          onReady: () => {
            setTimeout(() => {
              // Send mouseleave with specific coordinates
              window.postMessage(
                '[iFrameSizer]lifecycle12:200:250:mouseleave',
                '*',
              )
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Callback Execution Order', () => {
      it('should execute callbacks in correct order during initialization', (done) => {
        const callOrder = []

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle13',
          checkOrigin: false,
          onReady: () => {
            callOrder.push('onReady')
            
            setTimeout(() => {
              expect(callOrder).toEqual(['onReady'])
              done()
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should execute callbacks in correct order during close', (done) => {
        const callOrder = []

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle14',
          checkOrigin: false,
          onReady: (iframeEl) => {
            callOrder.push('onReady')
            setTimeout(() => {
              iframeEl.iframeResizer.close()
            }, 10)
          },
          onBeforeClose: () => {
            callOrder.push('onBeforeClose')
            return true
          },
          onAfterClose: () => {
            callOrder.push('onAfterClose')
            expect(callOrder).toEqual(['onReady', 'onBeforeClose', 'onAfterClose'])
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle multiple mouse events in sequence', (done) => {
        const events = []

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'lifecycle15',
          checkOrigin: false,
          mouseEvents: true,
          onMouseEnter: () => {
            events.push('enter')
          },
          onMouseLeave: () => {
            events.push('leave')
            expect(events).toEqual(['enter', 'leave'])
            done()
          },
          onReady: () => {
            setTimeout(() => {
              mockMsgFromIFrame(iframe, 'mouseenter')
              setTimeout(() => {
                mockMsgFromIFrame(iframe, 'mouseleave')
              }, 20)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

  })
})
