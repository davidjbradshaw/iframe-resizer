import { advise } from '../core/console'
import createIframeResize from './factory'

const iframeResize = createIframeResize()

if (typeof window !== 'undefined') {
  window.iFrameResize =
    window.iFrameResize ||
    function (...args) {
      advise('Parent', 'Deprecated: iFrameResize(), please use iframeResize()')
      iframeResize(...args)
    }
}

export default iframeResize
