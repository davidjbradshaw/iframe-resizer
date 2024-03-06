import { warn } from '../common/log'
import connectResizer from '../core/index'

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

      return this.filter('iframe').each(connectWithOptions).end()
    }

    window.jQuery.fn.iFrameResize = function (options) {
      warn(
        '',
        'Deprecated:  Use the iframeResize method instead of iFrameResize',
      )

      return this.iframeResize(options)
    }
}
