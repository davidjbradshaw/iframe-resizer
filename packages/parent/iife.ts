import { PARENT } from '../common/consts'
import { deprecateFunction } from '../core/console'
import createIframeResize from './factory'

window.iframeResize = createIframeResize()

window.iFrameResize = function (...args: any[]) {
  deprecateFunction('iFrameResize()', 'iframeResize()', '', PARENT)
  ;(window.iframeResize as Function)(...args)
}
