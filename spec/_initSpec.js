define(['iframeResizerParent'], (iframeResize) => {
  describe('iFrame init', () => {
    let iframe
    const id = 'initTest'

    beforeEach((done) => {
      loadIFrame('iframe600.html')

      iframe = iframeResize({
        license: 'GPLv3',
        log: true,
        id: id + '-',
        checkOrigin: false,
        inPageLinks: true,
        scrolling: true,
        tolerance: 1,
        direction: 'horizontal',
        onReady: () => {
          setTimeout(done, 1)
        },
      })[0]

      // Mock the init message from child
      mockMsgFromIFrame(iframe, 'init')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    it('should add an ID', () => {
      expect(iframe.id.split('-')[0]).toBe(id)
    })

    describe('methods', () => {
      it('should create iframeResizer object', () => {
        expect(iframe.iframeResizer).toBeDefined()
      })

      it('should create a close method', () => {
        expect(iframe.iframeResizer.close).toBeDefined()
      })

      it('should create a resize method', () => {
        expect(iframe.iframeResizer.resize).toBeDefined()
      })

      it('should create a moveToAnchor method', () => {
        expect(iframe.iframeResizer.moveToAnchor).toBeDefined()
      })

      it('should create a sendMessage method', () => {
        expect(iframe.iframeResizer.sendMessage).toBeDefined()
      })
    })
  })
})
