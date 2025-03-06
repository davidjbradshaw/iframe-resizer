import { deprecateFunction } from '../core/console'
import createIframeResize from './factory'

window.iframeResize = createIframeResize()

window.iFrameResize = function (...args) {
  deprecateFunction('iFrameResize()', 'iframeResize()', '', 'parent')
  window.iframeResize(...args)
}
