import { PARENT } from '../common/consts.ts'
import { deprecateFunction } from '../core/console.ts'
import createIframeResize from './factory'

window.iframeResize = createIframeResize()

window.iFrameResize = function (...args) {
  deprecateFunction('iFrameResize()', 'iframeResize()', '', PARENT)
  window.iframeResize(...args)
}
