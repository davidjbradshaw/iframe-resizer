define(['iframeResizerParent'], (iframeResize) => {
  describe('Direction option', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    // What the parent tells the child to size, read off the init message:
    // sizeWidth is field 2, sizeHeight 18 and maxContentWidth 24
    function sizingFor(id, direction) {
      iframe = document.getElementsByTagName('iframe')[0]
      iframe.id = id

      iframeResize({ license: 'GPLv3', id, checkOrigin: false, direction })

      const postMessage = spyOn(iframe.contentWindow, 'postMessage')
      window.postMessage('[iframeResizerChild]Ready', '*')

      return delay(50).then(() => {
        const fields = initMsgFields(postMessage)
        return {
          sizeWidth: fields[2],
          sizeHeight: fields[18],
          maxContentWidth: fields[24],
        }
      })
    }

    it('vertical sizes height only', async () => {
      expect(await sizingFor('dir1', 'vertical')).toEqual({
        sizeWidth: 'false',
        sizeHeight: 'true',
        maxContentWidth: 'false',
      })
    })

    it('both sizes height and width', async () => {
      expect(await sizingFor('dir2', 'both')).toEqual({
        sizeWidth: 'true',
        sizeHeight: 'true',
        maxContentWidth: 'true',
      })
    })

    it('none sizes neither', async () => {
      expect(await sizingFor('dir3', 'none')).toEqual({
        sizeWidth: 'false',
        sizeHeight: 'false',
        maxContentWidth: 'false',
      })
    })

    // The v5 width behaviour: the page keeps the iframe's width
    it('horizontal-block sizes width without max-content', async () => {
      expect(await sizingFor('dir4', 'horizontal-block')).toEqual({
        sizeWidth: 'true',
        sizeHeight: 'false',
        maxContentWidth: 'false',
      })
    })

    // The only direction that makes the page as wide as its content
    it('horizontal-inline sizes width with max-content', async () => {
      expect(await sizingFor('dir5', 'horizontal-inline')).toEqual({
        sizeWidth: 'true',
        sizeHeight: 'false',
        maxContentWidth: 'true',
      })
    })

    it('horizontal is a deprecated alias of horizontal-block', async () => {
      const deprecated = await sizingFor('dir6', 'horizontal')
      tearDown(iframe)
      removeFixtures()
      loadIFrame('iframe600.html')
      const block = await sizingFor('dir7', 'horizontal-block')

      expect(deprecated).toEqual(block)
    })
  })
})
