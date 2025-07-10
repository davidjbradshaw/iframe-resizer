define(['iframeResizerParent'], (iframeResize) => {
  describe('Close iFrame', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('closes from parent', (done) => {

      iframe = iframeResize({
        license: 'GPLv3',
        id: 'close2',
        onAfterClose: () => {
          setTimeout(done)
        },
        onReady: (iframe) => {
          console.log('>>> close from parent')
          iframe.iFrameResizer.sendMessage('close')
        },
      })[0]

      mockMsgFromIFrame(iframe, 'close')
    })
  })
})
