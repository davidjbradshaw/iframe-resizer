import './plugin'

import $ from 'jquery'

window.$ = $
window.jQuery = $

test('Plugin loads', () => {
  expect(window.$.fn.iframeResize).toBeDefined()
  expect(window.$.fn.iFrameResize).toBeDefined()
})
