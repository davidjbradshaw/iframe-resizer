import { PARENT_INFO } from '../../common/consts'
import { sendInfoToIframe, startInfoMonitor, stopInfoMonitor } from './common'

export function getParentProps(iframe: HTMLIFrameElement): string {
  const { scrollWidth, scrollHeight } = document.documentElement
  const visualViewport =
    typeof window !== 'undefined' && window.visualViewport
      ? window.visualViewport
      : {}
  const {
    width = 0,
    height = 0,
    offsetLeft = 0,
    offsetTop = 0,
    pageLeft = 0,
    pageTop = 0,
    scale = 1,
  } = visualViewport

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
