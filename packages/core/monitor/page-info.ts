import { PAGE_INFO } from '../../common/consts'
import { sendInfoToIframe, startInfoMonitor, stopInfoMonitor } from './common'

export function getPageInfo(iframe: HTMLIFrameElement): string {
  const bodyPosition = document.body.getBoundingClientRect()
  const iFramePosition = iframe.getBoundingClientRect()
  const { scrollY, scrollX, innerHeight, innerWidth } = window
  const { clientHeight, clientWidth } = document.documentElement

  return JSON.stringify({
    iframeHeight: iFramePosition.height,
    iframeWidth: iFramePosition.width,
    clientHeight: Math.max(clientHeight, innerHeight || 0),
    clientWidth: Math.max(clientWidth, innerWidth || 0),
    offsetTop: parseInt(iFramePosition.top - bodyPosition.top, 10),
    offsetLeft: parseInt(iFramePosition.left - bodyPosition.left, 10),
    scrollTop: scrollY,
    scrollLeft: scrollX,
    documentHeight: clientHeight,
    documentWidth: clientWidth,
    windowHeight: innerHeight,
    windowWidth: innerWidth,
  })
}

const sendPageInfoToIframe = sendInfoToIframe(PAGE_INFO, getPageInfo)

export const startPageInfoMonitor = startInfoMonitor(
  sendPageInfoToIframe,
  'PageInfo',
)

export const stopPageInfoMonitor = stopInfoMonitor('stopPageInfo')
