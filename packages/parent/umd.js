import { deprecateFunction } from '../core/console'
import createIframeResize from './factory'

const iframeResize = createIframeResize()

if (typeof window !== 'undefined') {
  window.iFrameResize =
    window.iFrameResize ||
    function (...args) {
      deprecateFunction('iFrameResize()', 'iframeResize()', '', 'parent')
      iframeResize(...args)
    }
}

export default iframeResize
