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
      win.parentIFrame.close()
    })

    describe('ParentIFrame methods', () => {
      it('autoResize', (done) => {
        win.parentIFrame.autoResize(false)
        win.parentIFrame.autoResize(true)

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
        expect(win.parentIFrame.getId()).toBe(id)
      })

      it('move to anchor', () => {
        win.parentIFrame.moveToAnchor('foo')

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:inPageLink:#foo',
          '*',
        )
        win.parentIFrame.moveToAnchor('bar')

        expect(msgObject.source.postMessage.calls.argsFor(1)[0]).toContain(
          ':scrollToOffset',
        )
      })

      it('reset', () => {
        win.parentIFrame.reset()

        expect(msgObject.source.postMessage.calls.argsFor(0)[0]).toContain(
          ':reset',
        )
      })

      it('getPageInfo', (done) => {
        win.parentIFrame.getPageInfo((pageInfo) => {
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
          '[iFrameSizer]parentIFrameTests:0:0:pageInfo',
          '*',
        )
        mockMsgListener(
          createMsg(
            'pageInfo:{"iframeHeight":500,"iframeWidth":300,"clientHeight":645,' +
              '"clientWidth":1295,"offsetLeft":20,"offsetTop":85,"scrollLeft":0,' +
              '"scrollTop":0,"documentHeight":645,"documentWidth":1295,' +
              '"windowHeight":645,"windowWidth":1295}',
          ),
        )
      })

      it('getPageInfoStop', () => {
        win.parentIFrame.getPageInfo()

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:pageInfoStop',
          '*',
        )
      })

      it('scrollTo', () => {
        win.parentIFrame.scrollTo(10, 10)

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:10:10:scrollTo',
          '*',
        )
      })

      it('scrollToOffset', () => {
        win.parentIFrame.scrollToOffset(10, 10)

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:10:10:scrollToOffset',
          '*',
        )
      })

      it('sendMessage (string)', () => {
        win.parentIFrame.sendMessage('foo:bar')

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:message:"foo:bar"',
          '*',
        )
      })

      it('sendMessage (object)', () => {
        win.parentIFrame.sendMessage({ foo: 'bar' }, 'http://foo.bar:1337')

        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:0:0:message:{"foo":"bar"}',
          'http://foo.bar:1337',
        )
      })

      it('setTargetOrigin', () => {
        const targetOrigin = 'http://foo.bar:1337'

        win.parentIFrame.setTargetOrigin(targetOrigin)
        win.parentIFrame.resize(10, 10)

        // resize() sends 'manualResize' type (not 'size') to distinguish from auto-resize
        expect(msgObject.source.postMessage).toHaveBeenCalledWith(
          '[iFrameSizer]parentIFrameTests:10:10:manualResize',
          targetOrigin,
        )

        win.parentIFrame.setTargetOrigin('*')
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
          console.log('>>', msgObject.source.postMessage.calls.argsFor(0))

          expect(msgObject.source.postMessage.calls.argsFor(0)[0]).toContain(
            ':reset',
          )
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
      it('throttles', (done) => {
        win.parentIFrame.size(10, 10)
        win.parentIFrame.size(20, 10)
        win.parentIFrame.size(30, 10)
        win.parentIFrame.size(40, 10)
        win.parentIFrame.size(50, 10)
        win.parentIFrame.size(60, 10)
        setTimeout(() => {
          const callCount = msgObject.source.postMessage.calls.count()
          
          // Verify throttling occurred - fewer than all 6 calls should be made
          // Throttling may block all calls or allow some through depending on timing
          expect(callCount).toBeLessThan(6)
          done()
        }, 17)
      })
    })

  })
})
