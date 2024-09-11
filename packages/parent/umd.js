import { advise } from '../core/log'
import createIframeResize from './factory'

const iframeResize = createIframeResize()

if (typeof window !== 'undefined') {
  window.iFrameResize =
    window.iFrameResize ||
    function (...args) {
      advise('', 'Deprecated: iFrameResize(), please use iframeResize()')
      iframeResize(...args)
    }
}

export default iframeResize
