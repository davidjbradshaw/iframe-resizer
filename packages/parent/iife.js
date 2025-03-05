import { advise } from '../core/console'
import createIframeResize from './factory'

window.iframeResize = createIframeResize()

window.iFrameResize = function (...args) {
  advise('Parent', 'Deprecated: iFrameResize(), please use iframeResize()')
  window.iframeResize(...args)
}
