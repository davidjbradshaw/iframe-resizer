define(['iframeResizerParent'], (iframeResize) => {
  describe('Parent Methods', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    describe('resize() method', () => {
      it('should trigger resize from parent', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method1',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Call resize method
            iframe.iframeResizer.resize()

            setTimeout(() => {
              // Should have sent resize message
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              const calls = iframe.contentWindow.postMessage.calls.all()
              const hasResizeMessage = calls.some((call) =>
                call.args[0].includes('resize'),
              )
              expect(hasResizeMessage).toBe(true)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should show deprecation warning', (done) => {
        spyOn(console, 'warn')

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method2',
          checkOrigin: false,
          onReady: () => {
            // Call deprecated resize method
            iframe.iframeResizer.resize()

            setTimeout(() => {
              // Should have warned about deprecation
              const warnCalls = console.warn.calls.all()
              const hasDeprecationWarning = warnCalls.some((call) =>
                call.args.some(
                  (arg) =>
                    typeof arg === 'string' &&
                    (arg.includes('Deprecated') || arg.includes('resize()')),
                ),
              )
              expect(hasDeprecationWarning).toBe(true)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should work multiple times', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method3',
          checkOrigin: false,
          onReady: () => {
            let callCount = 0
            spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
              callCount++
            })

            // Call resize multiple times
            iframe.iframeResizer.resize()
            iframe.iframeResizer.resize()
            iframe.iframeResizer.resize()

            setTimeout(() => {
              // Should have sent multiple messages
              expect(callCount).toBeGreaterThan(0)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('moveToAnchor() method', () => {
      it('should send anchor navigation message', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method4',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Call moveToAnchor
            iframe.iframeResizer.moveToAnchor('testAnchor')

            setTimeout(() => {
              // Should have sent moveToAnchor message
              expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
                '[iFrameSizer]moveToAnchor:testAnchor',
                '*',
              )
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should validate anchor parameter type', () => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method5',
          checkOrigin: false,
        })[0]

        mockMsgFromIFrame(iframe, 'init')

        // Should throw error for non-string anchor
        expect(() => {
          iframe.iframeResizer.moveToAnchor(123)
        }).toThrow()
      })

      it('should handle special characters in anchor', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method6',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Call with special characters
            iframe.iframeResizer.moveToAnchor('test-anchor_123')

            setTimeout(() => {
              // Should have sent message with special chars
              expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
                '[iFrameSizer]moveToAnchor:test-anchor_123',
                '*',
              )
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle empty anchor', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method7',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Call with empty string
            iframe.iframeResizer.moveToAnchor('')

            setTimeout(() => {
              // Should have sent message with empty anchor
              expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
                '[iFrameSizer]moveToAnchor:',
                '*',
              )
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('sendMessage() method', () => {
      it('should send string message', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method8',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Send string message
            iframe.iframeResizer.sendMessage('Hello')

            setTimeout(() => {
              // Should have sent message
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              const calls = iframe.contentWindow.postMessage.calls.all()
              const hasMessage = calls.some((call) =>
                call.args[0].includes('"Hello"'),
              )
              expect(hasMessage).toBe(true)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should send object message', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method9',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Send object message
            iframe.iframeResizer.sendMessage({ type: 'test', data: 123 })

            setTimeout(() => {
              // Should have sent JSON stringified message
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              const calls = iframe.contentWindow.postMessage.calls.all()
              const hasMessage = calls.some((call) =>
                call.args[0].includes('test') && call.args[0].includes('123'),
              )
              expect(hasMessage).toBe(true)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should send array message', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method10',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Send array message
            iframe.iframeResizer.sendMessage([1, 2, 3])

            setTimeout(() => {
              // Should have sent message
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should send null message', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method11',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Send null message
            iframe.iframeResizer.sendMessage(null)

            setTimeout(() => {
              // Should have sent message
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should send multiple messages in sequence', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method12',
          checkOrigin: false,
          onReady: () => {
            let callCount = 0
            spyOn(iframe.contentWindow, 'postMessage').and.callFake(() => {
              callCount++
            })

            // Send multiple messages
            iframe.iframeResizer.sendMessage('First')
            iframe.iframeResizer.sendMessage('Second')
            iframe.iframeResizer.sendMessage('Third')

            setTimeout(() => {
              // Should have sent all messages
              expect(callCount).toBeGreaterThanOrEqual(3)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('close() method', () => {
      it('should remove iframe from DOM', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method13',
          checkOrigin: false,
          onAfterClose: () => {
            // Iframe should be removed
            expect(document.getElementById('method13')).toBeNull()
            // Set iframe to null so tearDown doesn't try to close it
            iframe = null
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

      it('should call onBeforeClose callback', (done) => {
        let beforeCloseCalled = false

        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method14',
          checkOrigin: false,
          onBeforeClose: () => {
            beforeCloseCalled = true
            return true // Allow close
          },
          onAfterClose: () => {
            expect(beforeCloseCalled).toBe(true)
            // Set iframe to null so tearDown doesn't try to close it
            iframe = null
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
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method15',
          checkOrigin: false,
          onBeforeClose: () => {
            return false // Cancel close
          },
          onReady: (iframeEl) => {
            iframeEl.iframeResizer.close()

            setTimeout(() => {
              // Iframe should still exist
              expect(document.getElementById('method15')).not.toBeNull()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should handle close on already removed iframe', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method16',
          checkOrigin: false,
          onReady: (iframeEl) => {
            // Manually remove iframe
            const parent = iframeEl.parentNode
            parent.removeChild(iframeEl)

            setTimeout(() => {
              // Try to close already removed iframe
              iframeEl.iframeResizer.close()

              setTimeout(() => {
                // Should not crash
                expect(document.getElementById('method16')).toBeNull()
                done()
              }, 50)
            }, 10)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('disconnect() method', () => {
      it('should have disconnect method available', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method17',
          checkOrigin: false,
          onReady: (iframeEl) => {
            // Verify disconnect method exists
            expect(typeof iframeEl.iframeResizer.disconnect).toBe('function')
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('removeListeners() method (deprecated)', () => {
      it('should have removeListeners method available', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method18',
          checkOrigin: false,
          onReady: (iframeEl) => {
            // Verify method exists
            expect(typeof iframeEl.iframeResizer.removeListeners).toBe('function')
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Method chaining and combinations', () => {
      it('should allow calling methods in sequence', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method21',
          checkOrigin: false,
          onReady: (iframeEl) => {
            spyOn(iframeEl.contentWindow, 'postMessage')

            // Call multiple methods
            iframeEl.iframeResizer.sendMessage('test')
            iframeEl.iframeResizer.moveToAnchor('anchor')
            iframeEl.iframeResizer.resize()

            setTimeout(() => {
              // All methods should have been called
              expect(iframeEl.contentWindow.postMessage.calls.count()).toBeGreaterThan(0)
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should work after reset', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method22',
          checkOrigin: false,
          onReady: (iframeEl) => {
            // Send reset message
            mockMsgFromIFrame(iframeEl, 'reset')

            setTimeout(() => {
              spyOn(iframeEl.contentWindow, 'postMessage')

              // Methods should still work
              iframeEl.iframeResizer.sendMessage('after reset')

              setTimeout(() => {
                expect(iframeEl.contentWindow.postMessage).toHaveBeenCalled()
                done()
              }, 50)
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Legacy iFrameResizer property', () => {
      it('should support legacy property name', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method23',
          checkOrigin: false,
          onReady: () => {
            // Both property names should exist
            expect(iframe.iframeResizer).toBeDefined()
            expect(iframe.iFrameResizer).toBeDefined()
            
            // Both should reference same object
            expect(iframe.iframeResizer).toBe(iframe.iFrameResizer)
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should work with legacy property name', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method24',
          checkOrigin: false,
          onReady: () => {
            spyOn(iframe.contentWindow, 'postMessage')

            // Use legacy property name
            iframe.iFrameResizer.sendMessage('legacy test')

            setTimeout(() => {
              expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
              done()
            }, 50)
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })

    describe('Method availability', () => {
      it('should have all expected methods', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method25',
          checkOrigin: false,
          onReady: () => {
            // Check all methods exist
            expect(iframe.iframeResizer.resize).toBeDefined()
            expect(iframe.iframeResizer.moveToAnchor).toBeDefined()
            expect(iframe.iframeResizer.sendMessage).toBeDefined()
            expect(iframe.iframeResizer.close).toBeDefined()
            expect(iframe.iframeResizer.disconnect).toBeDefined()
            expect(iframe.iframeResizer.removeListeners).toBeDefined()
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })

      it('should have all methods as functions', (done) => {
        iframe = iframeResize({
          license: 'GPLv3',
          log: true,
          id: 'method26',
          checkOrigin: false,
          onReady: () => {
            // Check all are functions
            expect(typeof iframe.iframeResizer.resize).toBe('function')
            expect(typeof iframe.iframeResizer.moveToAnchor).toBe('function')
            expect(typeof iframe.iframeResizer.sendMessage).toBe('function')
            expect(typeof iframe.iframeResizer.close).toBe('function')
            expect(typeof iframe.iframeResizer.disconnect).toBe('function')
            expect(typeof iframe.iframeResizer.removeListeners).toBe('function')
            done()
          },
        })[0]

        mockMsgFromIFrame(iframe, 'init')
      })
    })
  })
})
