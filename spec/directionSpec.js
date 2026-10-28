define(['iframeResizerParent'], (iframeResize) => {
  describe('Direction option', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    async function bind(id, direction) {
      iframe = document.getElementsByTagName('iframe')[0]
      iframe.id = id

      iframeResize({ license: 'GPLv3', id, checkOrigin: false, direction })

      await iframeLoaded(iframe)
    }

    // What the parent tells the child to size, read off the init message:
    // sizeWidth is field 2, sizeHeight 18 and maxContentWidth 24
    function sizingFrom(postMessageSpy) {
      const fields = initMsgFields(postMessageSpy)

      return {
        sizeWidth: fields[2],
        sizeHeight: fields[18],
        maxContentWidth: fields[24],
      }
    }

    it('vertical sizes height only', async () => {
      await bind('dir1', 'vertical')

      const postMessage = spyOn(iframe.contentWindow, 'postMessage')
      await delay(50)

      expect(sizingFrom(postMessage)).toEqual({
        sizeWidth: 'false',
        sizeHeight: 'true',
        maxContentWidth: 'false',
      })
    })

    it('both sizes height and width', async () => {
      await bind('dir2', 'both')

      const postMessage = spyOn(iframe.contentWindow, 'postMessage')
      await delay(50)

      expect(sizingFrom(postMessage)).toEqual({
        sizeWidth: 'true',
        sizeHeight: 'true',
        maxContentWidth: 'true',
      })
    })

    it('none sizes neither', async () => {
      await bind('dir3', 'none')

      const postMessage = spyOn(iframe.contentWindow, 'postMessage')
      await delay(50)

      expect(sizingFrom(postMessage)).toEqual({
        sizeWidth: 'false',
        sizeHeight: 'false',
        maxContentWidth: 'false',
      })
    })

    // The v5 width behaviour: the page keeps the iframe's width
    it('horizontal-block sizes width without max-content', async () => {
      await bind('dir4', 'horizontal-block')

      const postMessage = spyOn(iframe.contentWindow, 'postMessage')
      await delay(50)

      expect(sizingFrom(postMessage)).toEqual({
        sizeWidth: 'true',
        sizeHeight: 'false',
        maxContentWidth: 'false',
      })
    })

    // The only direction that makes the page as wide as its content
    it('horizontal-inline sizes width with max-content', async () => {
      await bind('dir5', 'horizontal-inline')

      const postMessage = spyOn(iframe.contentWindow, 'postMessage')
      await delay(50)

      expect(sizingFrom(postMessage)).toEqual({
        sizeWidth: 'true',
        sizeHeight: 'false',
        maxContentWidth: 'true',
      })
    })

    it('horizontal is a deprecated alias of horizontal-block', async () => {
      await bind('dir6', 'horizontal')

      const deprecatedSpy = spyOn(iframe.contentWindow, 'postMessage')
      await delay(50)
      const deprecated = sizingFrom(deprecatedSpy)

      tearDown(iframe)
      removeFixtures()
      loadIFrame('iframe600.html')
      await bind('dir7', 'horizontal-block')

      const blockSpy = spyOn(iframe.contentWindow, 'postMessage')
      await delay(50)

      expect(deprecated).toEqual(sizingFrom(blockSpy))
    })
  })
})
