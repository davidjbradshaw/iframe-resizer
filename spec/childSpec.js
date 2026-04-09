define(['iframeResizerChild', 'jquery'], (mockMsgListener, $) => {
  describe('Child', () => {
    function createMsg(msg) {
      return {
        data: `[iFrameSizer]${msg}`,
        source: {
          postMessage(msg) {
            if (log) {
              console.log('PostMessage: ' + msg)
            }
          },
        },
      }
    }

    window.iframeResizer = {
      license: 'GPLv3',
      onMessage(msg) {
        msgCalled = msg
      },
      onReady() {
        this.readyCalled = true
      },
      targetOrigin: '*',
    }

    $(window.document.body).append('<a href="#foo" id="bar"></a>')

    // test early message is ignored
    mockMsgListener(createMsg('resize'))

    let log = true

    const id = 'parentIFrameTests'
    const childMsg =
      '8:true:' +
      log +
      ':9999:true:false:-8px:max:wheat:null:0:true:child:scroll:true:0:0:GPLv3:5.0.0'
    const msgObject = createMsg(id + ':' + childMsg)
    const win = mockMsgListener(msgObject)

    // test reset is ignored during init
    mockMsgListener(createMsg('reset'))

    window.msgCalled = null
    // window.readyCalled = null;

    beforeEach(() => {
      spyOn(msgObject.source, 'postMessage')
      spyOn(window.iframeResizer, 'onMessage')
      spyOn(window.iframeResizer, 'onReady')
      spyOn(console, 'log')
      spyOn(console, 'warn')
    })

    afterAll(() => {
      win.parentIframe.close()
    })

    describe('ParentIFrame methods', () => {
      it('autoResize', (done) => {
        win.parentIframe.autoResize(false)
        win.parentIframe.autoResize(true)

        setTimeout(() => {
          // Verify autoResize message was sent to parent
          expect(msgObject.source.postMessage).toHaveBeenCalledWith(
            '[iFrameSizer]parentIFrameTests:0:0:autoResize:true',
            '*',
          )
          done()
        }, 10)
      })

      it('Get ID of iFrame is same as iFrame', () => {
        expect(win.parentIframe.getId()).toBe(id)
      })

      it('move to anchor', () => {
        win.parentIframe.moveToAnchor('foo')

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:inPageLink:#foo',
          '*',
        )
        win.parentIframe.moveToAnchor('bar')

        expect(msgObject.source.postMessage.calls.argsFor(1)[0]).toContain(
          ':scrollToOffset',
        )
      })

      it('reset', () => {
        win.parentIframe.reset()

        expect(msgObject.source.postMessage.calls.argsFor(0)[0]).toContain(
          ':reset',
        )
      })

      it('getParentProps', (done) => {
        win.parentIframe.getParentProps((pageInfo) => {
          expect(pageInfo.iframeHeight).toBe(500)

          expect(pageInfo.iframeWidth).toBe(300)

          expect(pageInfo.offsetLeft).toBe(20)

          expect(pageInfo.offsetTop).toBe(85)

          expect(pageInfo.scrollTop).toBe(0)

          expect(pageInfo.scrollLeft).toBe(0)

          expect(pageInfo.documentHeight).toBe(645)

          expect(pageInfo.documentWidth).toBe(1295)

          expect(pageInfo.windowHeight).toBe(645)

          expect(pageInfo.windowWidth).toBe(1295)

          expect(pageInfo.clientHeight).toBe(645)

          expect(pageInfo.clientWidth).toBe(1295)
          done()
        })

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:parentInfo',
          '*',
        )
        mockMsgListener(
          createMsg(
            'parentInfo:{"iframeHeight":500,"iframeWidth":300,"clientHeight":645,' +
              '"clientWidth":1295,"offsetLeft":20,"offsetTop":85,"scrollLeft":0,' +
              '"scrollTop":0,"documentHeight":645,"documentWidth":1295,' +
              '"windowHeight":645,"windowWidth":1295}',
          ),
        )
      })

      it('getParentPropsStop', () => {
        const unsub = win.parentIframe.getParentProps(() => {})
        unsub()

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:parentInfoStop',
          '*',
        )
      })

      it('scrollTo', () => {
        win.parentIframe.scrollTo(10, 10)

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:10:10:scrollTo',
          '*',
        )
      })

      it('scrollToOffset', () => {
        win.parentIframe.scrollToOffset(10, 10)

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:10:10:scrollToOffset',
          '*',
        )
      })

      it('sendMessage (string)', () => {
        win.parentIframe.sendMessage('foo:bar')

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:message:"foo:bar"',
          '*',
        )
      })

      it('sendMessage (object)', () => {
        win.parentIframe.sendMessage({ foo: 'bar' }, 'http://foo.bar:1337')

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:message:{"foo":"bar"}',
          'http://foo.bar:1337',
        )
      })

      it('setTargetOrigin', (done) => {
        const targetOrigin = 'http://foo.bar:1337'

        win.parentIframe.setTargetOrigin(targetOrigin)
        win.parentIframe.resize(10, 10)

        // Use setTimeout to allow any pending async callbacks (e.g., IntersectionObserver,
        // RAF) to settle before checking, preventing intermittent race condition failures
        setTimeout(() => {
          // resize() sends 'manualResize' type (not 'size') to distinguish from auto-resize
          expect(msgObject.source.postMessage).toHaveBeenCalledWith(
            '[iFrameSizer]parentIFrameTests:10:10:manualResize',
            targetOrigin,
          )

          win.parentIframe.setTargetOrigin('*')
          done()
        })
      })
    })

    describe('inbound message', () => {
      it('readyCallback', () => {
        expect(window.readyCalled).toEqual(true)
      })

      it('message (String)', (done) => {
        const msg = 'foo'
        mockMsgListener(createMsg('message:' + JSON.stringify(msg)))

        setTimeout(() => {
          expect(msgCalled).toBe(msg)
          done()
        })
      })

      it('message (Object)', (done) => {
        const msg = { foo: 'bar' }
        mockMsgListener(createMsg('message:' + JSON.stringify(msg)))

        setTimeout(() => {
          expect(msgCalled.foo).toBe('bar')
          done()
        })
      })

      it('reset 2', (done) => {
        //  timing issue in Chrome
        setTimeout(() => {
          // Wait for init lock to clear
          mockMsgListener(createMsg('reset'))

          // Use mostRecent() to avoid fragile index-based check which could fail
          // if the IntersectionObserver or other async callbacks fire first
          expect(
            msgObject.source.postMessage.calls.mostRecent().args[0],
          ).toContain(':reset')
          done()
        }, 200)
      })

      it('move to anchor 2', () => {
        mockMsgListener(createMsg('moveToAnchor:foo'))

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:inPageLink:#foo',
          '*',
        )
      })

      it('unexpected message', (done) => {
        mockMsgListener(createMsg('foo'))

        setTimeout(() => {
          expect(console.warn).toHaveBeenCalledWith(
            'Unexpected message ([iFrameSizer]foo), this is likely due to a newer version of iframe-resizer running on the parent page.',
          )
          done()
        })
      })
    })

    describe('performance', () => {
      it('sends resize messages', (done) => {
        win.parentIframe.resize(100, 200)
        setTimeout(() => {
          const resizeCalls = msgObject.source.postMessage.calls
            .allArgs()
            .filter((args) => args[0].includes(':manualResize'))

          expect(resizeCalls.length).toBeGreaterThan(0)
          done()
        }, 17)
      })
    })

  })
})
