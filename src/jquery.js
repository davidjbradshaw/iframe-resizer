import { setupEventListeners, setupIFrame, warn } from './parent/main'

let setupComplete = false

function createJQueryPublicMethod($) {
  if (!$.fn) {
    warn('', 'Unable to bind to jQuery, it is not fully loaded.')
  } else if (!$.fn.iFrameResize) {
    $.fn.iFrameResize = function (options) {
      function initJQuery(index, element) {
        setupIFrame(element, options)
      }

      if (!setupComplete) {
        setupEventListeners()
        setupComplete = true
      }

      return this.filter('iframe').each(initJQuery).end()
    }
  }
}

if (window.jQuery === undefined) {
  warn('', 'Unable to bind to jQuery, it is not available.')
} else {
  createJQueryPublicMethod(window.jQuery)
}
