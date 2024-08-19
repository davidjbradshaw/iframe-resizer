define(['iframeResizerParent'], (iframeResize) => {
  describe('Setup error', () => {
    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('Unexpected data type', () => {
      expect(() => {
        iframeResize(
          {
            log: true,
            id: 'error2',
          },
          1,
        )
      }).toThrow(new TypeError('[iframeResizer] Unexpected data type (number)'))
    })

    it('Expected <IFRAME> tag', () => {
      expect(() => {
        iframeResize(
          {
            log: true,
            id: 'error3',
          },
          'div',
        )
      }).toThrow(
        new TypeError('[iframeResizer] Expected <IFRAME> tag, found <DIV>'),
      )
    })

    it('Not a valid DOM element', () => {
      expect(() => {
        iframeResize(
          {
            log: true,
            id: 'error4',
          },
          {},
        )
      }).toThrow(new TypeError('[iframeResizer] Not a valid DOM element'))
    })

    it('Options is not an object', () => {
      expect(() => {
        iframeResize('ERROR')
      }).toThrow(new TypeError('Options is not an object'))
    })
  })
})
