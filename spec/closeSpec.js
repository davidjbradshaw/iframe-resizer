define(['iframeResizerParent'], (iframeResize) => {
  describe('Close iFrame', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    it('closes when the child asks', (done) => {
      iframe = iframeResize({
        license: 'GPLv3',
        id: 'close2',
        onAfterClose: (id) => {
          expect(id).toBe('close2')
          expect(document.getElementById('close2')).toBeNull()
          setTimeout(done)
        },
      })[0]

      mockMsgFromIFrame(iframe, 'close')
    })
  })
})
