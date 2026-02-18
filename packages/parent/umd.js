import { PARENT, UNDEFINED } from '../common/consts.ts'
import { deprecateFunction } from '../core/console.ts'
import createIframeResize from './factory'

const iframeResize = createIframeResize()

if (typeof window !== UNDEFINED) {
  window.iFrameResize =
    window.iFrameResize ||
    function (...args) {
      deprecateFunction('iFrameResize()', 'iframeResize()', '', PARENT)
      iframeResize(...args)
    }
}

export default iframeResize
