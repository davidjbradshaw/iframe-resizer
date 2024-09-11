import { advise } from '../core/log'
import createIframeResize from './factory'

window.iframeResize = createIframeResize()

window.iFrameResize = function (...args) {
  advise('', 'Deprecated: iFrameResize(), please use iframeResize()')
  window.iframeResize(...args)
}
