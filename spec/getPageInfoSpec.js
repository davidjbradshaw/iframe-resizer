define(['iframeResizerParent'], (iframeResize) => {
  describe('Get Page info', () => {
    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('requested from iFrame', async () => {
      const iframe = iframeResize({
        license: 'GPLv3',
        log: true,
        id: 'getPageInfo',
        checkOrigin: false,
      })[0]

      mockMsgFromIFrame(iframe, 'init')
      await delay(50)

      await iframeLoaded(iframe)
      const postMessage = spyOn(iframe.contentWindow, 'postMessage')

      mockMsgFromIFrame(iframe, 'pageInfo')
      await delay(50)

      const info = lastJsonMsg(postMessage, 'pageInfo')

      const rect = iframe.getBoundingClientRect()
      const body = document.body.getBoundingClientRect()

      expect(info).withContext('no pageInfo was sent').toBeDefined()
      expect(info.offsetTop).toBe(Math.trunc(rect.top - body.top))
      expect(info.offsetLeft).toBe(Math.trunc(rect.left - body.left))
      expect(info.scrollTop).toBe(window.scrollY)
      expect(info.scrollLeft).toBe(window.scrollX)

      mockMsgFromIFrame(iframe, 'pageInfoStop')
      await delay(50)
      postMessage.calls.reset()

      window.dispatchEvent(new Event('resize'))
      await delay(50)

      expect(countJsonMsgs(postMessage, 'pageInfo')).toBe(0)

      tearDown(iframe)
    })
  })

  describe('Get Page info with multiple frames', () => {
    beforeEach(() => {
      loadIFrame('twoIFrame600WithId.html')
    })

    // One monitor runs per iframe, so a page change has to reach both
    it('must send pageInfo to second frame', async () => {
      const iframes = iframeResize({
        license: 'GPLv3',
        log: true,
        checkOrigin: false,
      })

      expect(iframes.length).toBe(2)

      const [iframe1, iframe2] = iframes

      mockMsgFromIFrame(iframe1, 'init')
      mockMsgFromIFrame(iframe2, 'init')
      await delay(50)

      mockMsgFromIFrame(iframe1, 'pageInfo')
      mockMsgFromIFrame(iframe2, 'pageInfo')
      await delay(50)

      await iframeLoaded(iframe1)
      const postMessage1 = spyOn(iframe1.contentWindow, 'postMessage')
      await iframeLoaded(iframe2)
      const postMessage2 = spyOn(iframe2.contentWindow, 'postMessage')

      window.dispatchEvent(new Event('resize'))
      await delay(50)

      expect(countJsonMsgs(postMessage1, 'pageInfo')).toBeGreaterThan(0)
      expect(countJsonMsgs(postMessage2, 'pageInfo')).toBeGreaterThan(0)

      // The two frames sit one above the other, so the lower one is offset
      expect(lastJsonMsg(postMessage2, 'pageInfo').offsetTop).toBeGreaterThan(
        lastJsonMsg(postMessage1, 'pageInfo').offsetTop,
      )

      mockMsgFromIFrame(iframe1, 'pageInfoStop')
      mockMsgFromIFrame(iframe2, 'pageInfoStop')

      tearDown(iframe1)
      tearDown(iframe2)
    })
  })
})
