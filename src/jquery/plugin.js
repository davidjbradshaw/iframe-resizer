import { warn } from '../common/log'
import { setupEventListeners, setupIFrame } from '../parent/main'

let eventListenesEnabled = false

const initJQuery = (options) => (element) => setupIFrame(element, options)

switch (true) {
  case window.jQuery === undefined:
    warn('', 'Unable to bind to jQuery, it is not available.')
    break

  case !window.jQuery.fn:
    warn('', 'Unable to bind to jQuery, it is not fully loaded.')
    break

  case window.jQuery.fn.iFrameResize:
    warn('', 'iFrameResize is already assigned to jQuery.fn.')
    break

  default:
    window.jQuery.fn.iframeResize = function (options) {
      if (!eventListenesEnabled) {
        setupEventListeners()
        eventListenesEnabled = true
      }

      return this.filter('iframe').each(initJQuery(options)).end()
    }

    window.jQuery.fn.iFrameResize = window.jQuery.fn.iframeResize
}
