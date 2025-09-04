import { PARENT_INFO } from '../common/consts'
import { sendInfoToIframe, startInfoMonitor, stopInfoMonitor } from './monitor'

export function getParentProps(iframe) {
  const { scrollWidth, scrollHeight } = document.documentElement
  const { width, height, offsetLeft, offsetTop, pageLeft, pageTop, scale } =
    window.visualViewport

  return JSON.stringify({
    iframe: iframe.getBoundingClientRect(),
    document: {
      scrollWidth,
      scrollHeight,
    },
    viewport: {
      width,
      height,
      offsetLeft,
      offsetTop,
      pageLeft,
      pageTop,
      scale,
    },
  })
}

const sendParentInfoToIframe = sendInfoToIframe(PARENT_INFO, getParentProps)

export const startParentInfoMonitor = startInfoMonitor(
  sendParentInfoToIframe,
  'ParentInfo',
)

export const stopParentInfoMonitor = stopInfoMonitor('stopParentInfo')
