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
      xit('autoResize', (done) => {
        win.parentIframe.autoResize(false)
        win.parentIFrame.autoResize(true)

        setTimeout(() => {
          expect(console.log).toHaveBeenCalledWith(
            'Resize event: Auto Resize enabled',
          )
          done()
        })
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

      xit('resize(max)', (done) => {
        win.parentIFrame.setHeightCalculationMethod('max')
        mockMsgListener(createMsg('resize'))

        setTimeout(() => {
          expect(console.log).toHaveBeenCalledWith(
            'Height calculation method set to "max"',
          )
          done()
        })
      })

      xit('resize(lowestElement)', (done) => {
        win.parentIFrame.setHeightCalculationMethod('lowestElement')
        mockMsgListener(createMsg('resize'))

        setTimeout(() => {
          expect(console.log).toHaveBeenCalledWith(
            'Height calculation method set to "lowestElement"',
          )
          done()
        })
      })

      xit('resize(rightMostElement)', (done) => {
        win.parentIFrame.setWidthCalculationMethod('rightMostElement')
        mockMsgListener(createMsg('resize'))

        setTimeout(() => {
          expect(console.log).toHaveBeenCalledWith(
            'Width calculation method set to "rightMostElement"',
          )
          done()
        })
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

    xdescribe('performance', () => {
      it('throttles', (done) => {
        win.parentIFrame.size(10, 10)
        win.parentIFrame.size(20, 10)
        win.parentIFrame.size(30, 10)
        win.parentIFrame.size(40, 10)
        win.parentIFrame.size(50, 10)
        win.parentIFrame.size(60, 10)
        setTimeout(() => {
          //  expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:10:10:size', '*');
          expect(msgObject.source.postMessage).not.toHaveBeenCalledWith(
            '[iFrameSizer]parentIFrameTests:20:10:size',
            '*',
          )

          expect(msgObject.source.postMessage).not.toHaveBeenCalledWith(
            '[iFrameSizer]parentIFrameTests:30:10:size',
            '*',
          )

          expect(msgObject.source.postMessage).not.toHaveBeenCalledWith(
            '[iFrameSizer]parentIFrameTests:40:10:size',
            '*',
          )

          expect(msgObject.source.postMessage).not.toHaveBeenCalledWith(
            '[iFrameSizer]parentIFrameTests:50:10:size',
            '*',
          )

          expect(msgObject.source.postMessage).toHaveBeenCalledWith(
            '[iFrameSizer]parentIFrameTests:10:10:size',
            '*',
          )
          done()
        }, 17)
      })
    })

    xdescribe('height calculation methods', () => {
      it('invalid', (done) => {
        win.parentIFrame.setHeightCalculationMethod('foo')

        setTimeout(() => {
          expect(console.warn).toHaveBeenCalledWith(
            'foo is not a valid option for heightCalculationMethod.',
          )

          expect(console.log).toHaveBeenCalledWith(
            'Height calculation method set to "auto"',
          )
          done()
        })

        win.parentIFrame.size()
      })

      it('bodyOffset', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('bodyOffset')
          win.parentIFrame.size()
          done()
        }, 10)
      })

      it('offset', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('offset')
          win.parentIFrame.size()
          done()
        }, 20)
      })

      it('bodyScroll', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('bodyScroll')
          win.parentIFrame.size()
          done()
        }, 30)
      })

      it('documentElementOffset', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('documentElementOffset')
          win.parentIFrame.size()
          done()
        }, 40)
      })

      it('documentElementScroll', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('documentElementScroll')
          win.parentIFrame.size()
          done()
        }, 50)
      })

      it('max', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('max')
          win.parentIFrame.size()
          done()
        }, 60)
      })

      it('min', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('min')
          win.parentIFrame.size()
          done()
        }, 70)
      })

      it('lowestElement', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('lowestElement')
          win.parentIFrame.size()
          done()
        }, 90)
      })

      it('taggedElement', (done) => {
        setTimeout(() => {
          win.parentIFrame.setHeightCalculationMethod('taggedElement')
          win.parentIFrame.size()
          done()
        }, 100)
      })
    })

    describe('width calculation methods', () => {
      xit('invalid 2', (done) => {
        win.parentIFrame.setWidthCalculationMethod('foo')

        setTimeout(() => {
          expect(console.warn).toHaveBeenCalledWith(
            'foo is not a valid option for widthCalculationMethod.',
          )

          expect(console.log).toHaveBeenCalledWith(
            'Width calculation method set to "scroll"',
          )
          done()
        })
        win.parentIFrame.size()
      })

      it('bodyOffset 2', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('bodyOffset')
          win.parentIFrame.size()
          done()
        }, 110)
      })

      it('bodyScroll 2', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('bodyScroll')
          win.parentIFrame.size()
          done()
        }, 120)
      })

      it('documentElementOffset 2', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('documentElementOffset')
          win.parentIFrame.size()
          done()
        }, 130)
      })

      it('documentElementScroll:', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('documentElementScroll:')
          win.parentIFrame.size()
          done()
        }, 140)
      })

      it('scroll', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('scroll')
          win.parentIFrame.size()
          done()
        }, 150)
      })

      it('max 2', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('max')
          win.parentIFrame.size()
          done()
        }, 160)
      })

      it('min 2', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('min')
          win.parentIFrame.size()
          done()
        }, 170)
      })

      it('leftMostElement', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('leftMostElement')
          win.parentIFrame.size()
          done()
        }, 180)
      })

      it('taggedElement 2', (done) => {
        setTimeout(() => {
          win.parentIFrame.setWidthCalculationMethod('taggedElement')
          win.parentIFrame.size()
          done()
        }, 190)
      })
    })
  })
})
