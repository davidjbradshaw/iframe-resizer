define(['iframeResizerParent'], (iframeResize) => {
  xdescribe('iFrame init', () => {
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

      console.log('iframe', iframe)
    })

    afterEach(() => {
      tearDown(iframe)
    })

    it('should add an ID', () => {
      expect(iframe.id.split('-')[0]).toBe(id)
    })

    describe('methods', () => {
      it('should create iFrameResizer object', () => {
        expect(iframe.iFrameResizer).toBeDefined()
      })

      it('should create a close method', () => {
        expect(iframe.iFrameResizer.close).toBeDefined()
      })

      it('should create a resize method', () => {
        expect(iframe.iFrameResizer.resize).toBeDefined()
      })

      it('should create a moveToAnchor method', () => {
        expect(iframe.iFrameResizer.moveToAnchor).toBeDefined()
      })

      it('should create a sendMessage method', () => {
        expect(iframe.iFrameResizer.sendMessage).toBeDefined()
      })
    })
  })
})
