import { LOAD, RESIZE, SCROLL } from '../../common/consts'
import { addEventListener, removeEventListener } from '../../common/listeners'
import { event, log } from '../console'
import trigger from '../send/trigger'
import settings from '../values/settings'

export const sendInfoToIframe = (type: string, infoFunction: (iframe: HTMLIFrameElement) => string) => {
  const gate: Record<string, number | null> = {}

  return (requestType: string, id: string): void => {
    const { iframe } = settings[id]

    function throttle(func: () => void, frameId: string): void {
      if (!gate[frameId]) {
        func()
        gate[frameId] = requestAnimationFrame(() => {
          gate[frameId] = null
        })
      }
    }

    function gatedTrigger(): void {
      trigger(`${requestType} (${type})`, `${type}:${infoFunction(iframe)}`, id)
    }

    throttle(gatedTrigger, id)
  }
}

export const stopInfoMonitor = (stopFunction: string) => (id: string): void => {
  if (stopFunction in settings[id]) {
    settings[id][stopFunction]()
    delete settings[id][stopFunction]
  }
}

export const startInfoMonitor = (sendInfoToIframe: (requestType: string, id: string) => void, type: string) => (id: string): void => {
  let pending = false

  const sendInfo = (requestType: string) => (): void => {
    if (settings[id]) {
      if (!pending || pending === requestType) {
        sendInfoToIframe(requestType, id)

        pending = requestType
        requestAnimationFrame(() => {
          pending = false
        })
      }
    } else {
      stop()
    }
  }

  const sendScroll = sendInfo(SCROLL)
  const sendResize = sendInfo('resize window')

  function setListener(requestType: string, listener: (target: EventTarget, event: string, handler: EventListener) => void): void {
    log(id, `${requestType}listeners for send${type}`)
    listener(window, SCROLL, sendScroll)
    listener(window, RESIZE, sendResize)
  }

  function stop(): void {
    event(id, `stop${type}`)
    setListener('Remove ', removeEventListener)
    pageObserver.disconnect()
    iframeObserver.disconnect()
    if (settings[id]) {
      removeEventListener(settings[id].iframe, LOAD, stop)
    }
  }

  function start(): void {
    setListener('Add ', addEventListener)

    pageObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    })

    iframeObserver.observe(settings[id].iframe, {
      attributes: true,
      childList: false,
      subtree: false,
    })
  }

  const pageObserver = new ResizeObserver(sendInfo('pageObserver'))
  const iframeObserver = new ResizeObserver(sendInfo('iframeObserver'))

  if (!settings[id]) return

  settings[id][`stop${type}`] = stop
  addEventListener(settings[id].iframe, LOAD, stop)
  start()
}
