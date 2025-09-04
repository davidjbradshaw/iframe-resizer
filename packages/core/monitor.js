import { LOAD, RESIZE, SCROLL } from '../common/consts'
import { addEventListener, removeEventListener } from '../common/listeners'
import { event, log } from './console'
import trigger from './send/trigger'
import settings from './values/settings'

export const sendInfoToIframe = (type, infoFunction) => (requestType, id) => {
  const gate = {}
  const { iframe } = settings[id]

  function throttle(func, frameId) {
    if (!gate[frameId]) {
      func()
      gate[frameId] = requestAnimationFrame(() => {
        gate[frameId] = null
      })
    }
  }

  function gatedTrigger() {
    trigger(`${requestType} (${type})`, `${type}:${infoFunction(iframe)}`, id)
  }

  throttle(gatedTrigger, id)
}

export const stopInfoMonitor = (stopFunction) => (id) => {
  if (stopFunction in settings[id]) {
    settings[id][stopFunction]()
    delete settings[id][stopFunction]
  }
}

export const startInfoMonitor = (sendInfoToIframe, type) => (id) => {
  let pending = false

  const sendInfo = (requestType) => () => {
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

  function setListener(requestType, listener) {
    log(id, `${requestType}listeners for send${type}`)
    listener(window, SCROLL, sendScroll)
    listener(window, RESIZE, sendResize)
  }

  function stop() {
    event(id, `stop${type}`)
    setListener('Remove ', removeEventListener)
    pageObserver.disconnect()
    iframeObserver.disconnect()
    removeEventListener(settings[id].iframe, LOAD, stop)
  }

  function start() {
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
