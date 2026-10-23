define(['iframeResizerParent'], (iframeResize) => {
  describe('Wire protocol', () => {
    let iframe

    beforeEach(() => {
      loadIFrame('iframe600.html')
    })

    afterEach(() => {
      tearDown(iframe)
    })

    // Sending the init message needs the child to look ready, as no child
    // script runs in the fixture
    async function bind(id, options) {
      iframe = document.getElementsByTagName('iframe')[0]
      iframe.id = id

      iframeResize({
        license: 'GPLv3',
        checkOrigin: false,
        ...options,
      })

      const postMessage = await spyOnIframeMessages(iframe)
      window.postMessage('[iframeResizerChild]Ready', '*')
      await delay(50)

      return initMsgFields(postMessage)
    }

    // The init message is a colon-separated string rather than JSON so that a
    // v1-v5 child still understands a v6 parent. Any field that moves, or any
    // new field inserted before the end, breaks those children, so each one
    // is pinned here by position.
    it('sends the init fields in order', async () => {
      const fields = await bind('protocol1', { log: true })

      expect(fields).withContext('no init message was sent').toBeDefined()
      expect(fields.slice(0, 20)).toEqual([
        'protocol1', // 0  id
        '8', // 1  v1 bodyPadding
        'false', // 2  sizeWidth
        'true', // 3  log
        '32', // 4  v1 interval
        'true', // 5  v1 publicMethods
        'true', // 6  autoResize
        '', // 7  bodyMargin
        'auto', // 8  heightCalculationMethod
        '', // 9  bodyBackground
        '', // 10 bodyPadding
        '0', // 11 tolerance
        'false', // 12 inPageLinks
        'child', // 13 resizeFrom
        'auto', // 14 widthCalculationMethod
        'false', // 15 mouseEvents, see below
        '', // 16 offsetHeight
        '', // 17 offsetWidth
        'true', // 18 sizeHeight
        'GPLv3', // 19 license
      ])

      expect(fields[20]).toBe(iframe.iframeResizer.getVersion().parent)
      expect(fields[21]).toMatch(/^-?\d+$/) // 21 mode
      expect(fields[22]).toBe('') // 22 sizeSelector, not yet in use
      expect(fields[23]).toBe('false') // 23 logExpand
      expect(fields[24]).toBe('false') // 24 maxContentWidth
      expect(fields.length).toBe(25)
    })

    it('carries the options that the child acts on', async () => {
      const fields = await bind('protocol2', {
        tolerance: 5,
        inPageLinks: true,
        offsetHeight: 12,
        offsetWidth: 13,
        heightCalculationMethod: 'taggedElement',
        bodyMargin: 10,
      })

      expect(fields.length).toBe(25)
      expect(fields[7]).toBe('10px')
      expect(fields[8]).toBe('taggedElement')
      expect(fields[11]).toBe('5')
      expect(fields[12]).toBe('true')
      expect(fields[16]).toBe('12')
      expect(fields[17]).toBe('13')
    })

    // The child only sends mouse messages when the parent asks, and it asks
    // only when the page gave it a handler
    it('asks for mouse events only when a handler was given', async () => {
      const fields = await bind('protocol4', { onMouseEnter: () => {} })

      expect(fields[15]).toBe('true')
    })

    // A colon in free text would shift every field after it, so the parent
    // escapes those fields and the child unescapes them
    it('escapes a colon in a free text field', async () => {
      const fields = await bind('protocol3', {
        bodyBackground: 'url(https://example.com/x.png)',
      })

      expect(fields.length).toBe(25)
      expect(fields[9]).toBe('url(https%3A//example.com/x.png)')
      expect(fields[10]).toBe('')
    })

    // React's useId() produces ids of this shape
    it('escapes a colon in the id', async () => {
      const fields = await bind(':r1:', {})

      expect(fields.length).toBe(25)
      expect(fields[0]).toBe('%3Ar1%3A')
    })
  })
})
