import { PARENT, UNDEFINED } from '../common/consts'
import { deprecateFunction } from '../core/console'
import createIframeResize from './factory'

const iframeResize = createIframeResize()

if (typeof window !== UNDEFINED) {
  window.iFrameResize =
    window.iFrameResize ||
    function (...args: any[]) {
      deprecateFunction('iFrameResize()', 'iframeResize()', '', PARENT)
      ;(iframeResize as Function)(...args)
    }
}

export default iframeResize
