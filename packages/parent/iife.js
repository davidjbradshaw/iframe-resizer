import { PARENT } from '../common/consts'
import { deprecateFunction } from '../core/console'
import createIframeResize from './factory'

window.iframeResize = createIframeResize()

window.iFrameResize = function (...args) {
  deprecateFunction('iFrameResize()', 'iframeResize()', '', PARENT)
  window.iframeResize(...args)
}
