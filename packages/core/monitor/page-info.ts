import { PAGE_INFO } from '@iframe-resizer/common'

import { sendInfoToIframe, startInfoMonitor, stopInfoMonitor } from './common'

export function getPageInfo(iframe: HTMLIFrameElement): string {
  const bodyPosition = document.body.getBoundingClientRect()
  const iframePosition = iframe.getBoundingClientRect()
  const { scrollY, scrollX, innerHeight, innerWidth } = window
  const { clientHeight, clientWidth } = document.documentElement

  return JSON.stringify({
    iframeHeight: iframePosition.height,
    iframeWidth: iframePosition.width,
    clientHeight: Math.max(clientHeight, innerHeight || 0),
    clientWidth: Math.max(clientWidth, innerWidth || 0),
    offsetTop: Math.trunc(iframePosition.top - bodyPosition.top),
    offsetLeft: Math.trunc(iframePosition.left - bodyPosition.left),
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
