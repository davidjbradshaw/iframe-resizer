import { addEventListener, removeEventListener } from '@iframe-resizer/common'
import { LOAD, RESIZE, SCROLL } from '@iframe-resizer/common/consts'

import { event, log } from '../console'
import trigger from '../send/trigger'
import settings from '../values/settings'

export const sendInfoToIframe = (
  type: string,
  infoFunction: (iframe: HTMLIFrameElement) => string,
) => {
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

export const stopInfoMonitor =
  (stopFunction: string) =>
  (id: string): void => {
    if (stopFunction in settings[id]) {
      settings[id][stopFunction]()
      delete settings[id][stopFunction]
    }
  }

export const startInfoMonitor =
  // eslint-disable-next-line @typescript-eslint/no-shadow
  (sendInfoToIframe: (requestType: string, id: string) => void, type: string) =>
    (id: string): void => {
      if (!settings[id]) return

      const key = `stop${type}`

      // Replace a monitor already running for this iframe, rather than leak it
      stopInfoMonitor(key)(id)

      let pending: string | false = false

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
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          stop()
        }
      }

      const sendScroll = sendInfo(SCROLL)
      const sendResize = sendInfo('resize window')

      const pageObserver = new ResizeObserver(sendInfo('pageObserver'))
      const iframeObserver = new ResizeObserver(sendInfo('iframeObserver'))

      function setListener(
        requestType: string,
        listener: (
          target: EventTarget,
          event: string,
          handler: EventListener,
        ) => void,
      ): void {
        log(id, `${requestType}listeners for send${type}`)
        listener(window, SCROLL, sendScroll)
        listener(window, RESIZE, sendResize)
      }

      function stop(): void {
        event(id, key)
        setListener('Remove ', removeEventListener)
        pageObserver.disconnect()
        iframeObserver.disconnect()
        if (!settings[id]) return

        removeEventListener(settings[id].iframe, LOAD, stop)
        // Unless a newer monitor has replaced this one
        if (settings[id][key] === stop) delete settings[id][key]
      }

      function start(): void {
        setListener('Add ', addEventListener)

        pageObserver.observe(document.body)
        iframeObserver.observe(settings[id].iframe)
      }

      settings[id][key] = stop
      addEventListener(settings[id].iframe, LOAD, stop)
      start()
    }
