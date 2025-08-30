import { UNDEFINED } from '../common/consts'
import { deprecateFunction } from '../core/console'
import createIframeResize from './factory'

const iframeResize = createIframeResize()

if (typeof window !== UNDEFINED) {
  window.iFrameResize =
    window.iFrameResize ||
    function (...args) {
      deprecateFunction('iFrameResize()', 'iframeResize()', '', 'parent')
      iframeResize(...args)
    }
}

export default iframeResize
