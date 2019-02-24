define(['iframeResizer'], function(iFrameResize) {
  describe('Setup error', function() {
    var iframe
    var log = LOG

    beforeEach(function() {
      loadIFrame('iframe600.html')
    })

    it('min > max', function() {
      expect(function() {
        iFrameResize({
          log: log,
          id: 'error1',
          maxHeight: 100,
          minHeight: 999
        })
      }).toThrow(
        new Error('Value for minHeight can not be greater than maxHeight')
      )
    })

    it('Unexpected data type', function() {
      expect(function() {
        iFrameResize(
          {
            log: log,
            id: 'error2'
          },
          1
        )
      }).toThrow(new TypeError('Unexpected data type (number)'))
    })

    it('Expected <IFRAME> tag', function() {
      expect(function() {
        iFrameResize(
          {
            log: log,
            id: 'error3'
          },
          'div'
        )
      }).toThrow(new TypeError('Expected <IFRAME> tag, found <DIV>'))
    })

    it('Object is not a valid DOM element', function() {
      expect(function() {
        iFrameResize(
          {
            log: log,
            id: 'error4'
          },
          {}
        )
      }).toThrow(new TypeError('Object is not a valid DOM element'))
    })

    it('Options is not an object', function() {
      expect(function() {
        iFrameResize('ERROR')
      }).toThrow(new TypeError('Options is not an object'))
    })
  })
})
