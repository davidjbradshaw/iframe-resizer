import connectResizer from '@iframe-resizer/core'

// eslint-disable-next-line import/extensions
import { warn } from '../core/console'

switch (true) {
  case window.jQuery === undefined:
    warn('', 'Unable to bind to jQuery, it is not available.')
    break

  case !window.jQuery.fn:
    warn('', 'Unable to bind to jQuery, it is not fully loaded.')
    break

  case window.jQuery.fn.iframeResize:
    warn('', 'iframeResize is already assigned to jQuery.fn.')
    break

  default:
    window.jQuery.fn.iframeResize = function (options) {
      const connectWithOptions = connectResizer(options)
      const init = (i, el) => connectWithOptions(el)

      return this.filter('iframe').each(init).end()
    }
}
