import { HIGHLIGHT } from 'auto-console-group'

import {
  AUTO_RESIZE,
  BEFORE_UNLOAD,
  CLOSE,
  IN_PAGE_LINK,
  INIT,
  MESSAGE,
  MOUSE_ENTER,
  MOUSE_LEAVE,
  PAGE_INFO,
  PAGE_INFO_STOP,
  PARENT_INFO,
  PARENT_INFO_STOP,
  RESET,
  SCROLL_BY,
  SCROLL_TO,
  SCROLL_TO_OFFSET,
  TITLE,
} from '../common/consts'
import checkSameDomain from './checks/origin'
import checkVersion from './checks/version'
import { info, log, warn } from './console'
import { onMessage } from './events/message'
import onMouse from './events/mouse'
import resizeIframe from './events/resize'
import on from './events/wrapper'
import closeIframe from './methods/close'
import resetIframe from './methods/reset'
import { startPageInfoMonitor, stopPageInfoMonitor } from './monitor/page-info'
import { startParentInfoMonitor, stopParentInfoMonitor } from './monitor/props'
import inPageLink from './page/in-page-link'
import { scrollBy, scrollTo, scrollToOffset } from './page/scroll'
import { setTitle } from './page/title'
import getMessageBody from './received/message'
import firstRun from './setup/first-run'
import settings from './values/settings'

interface MessageData {
  id: string
  iframe: HTMLIFrameElement
  height: number
  width: number
  type: string
  msg?: string
  message?: string
  mode?: string
}

export default function routeMessage(messageData: MessageData): void {
  const { height, id, iframe, mode, message, type, width } = messageData
  const { lastMessage } = settings[id]

  if (settings[id]?.firstRun) firstRun(id, mode)
  log(id, `Received: %c${lastMessage}`, HIGHLIGHT)

  switch (type) {
    case AUTO_RESIZE:
      settings[id].autoResize = JSON.parse(getMessageBody(id, 9))
      break

    case BEFORE_UNLOAD:
      info(id, 'Ready state reset')
      settings[id].initialised = false
      break

    case CLOSE:
      closeIframe(iframe)
      break

    case IN_PAGE_LINK:
      inPageLink(id, getMessageBody(id, 9))
      break

    case INIT:
      resizeIframe(messageData)
      checkSameDomain(id)
      checkVersion(id, message)
      settings[id].initialised = true
      on(id, 'onReady', iframe)
      break

    case MESSAGE:
      onMessage(messageData, getMessageBody(id, 6))
      break

    case MOUSE_ENTER:
      onMouse('onMouseEnter', messageData)
      break

    case MOUSE_LEAVE:
      onMouse('onMouseLeave', messageData)
      break

    case PAGE_INFO:
      startPageInfoMonitor(id)
      break

    case PARENT_INFO:
      startParentInfoMonitor(id)
      break

    case PAGE_INFO_STOP:
      stopPageInfoMonitor(id)
      break

    case PARENT_INFO_STOP:
      stopParentInfoMonitor(id)
      break

    case RESET:
      resetIframe(messageData)
      break

    case SCROLL_BY:
      scrollBy(messageData)
      break

    case SCROLL_TO:
      scrollTo(messageData)
      break

    case SCROLL_TO_OFFSET:
      scrollToOffset(messageData)
      break

    case TITLE:
      setTitle(id, message)
      break

    default:
      if (width === 0 && height === 0) {
        warn(
          id,
          `Unsupported message received (${type}), this is likely due to the iframe containing a later ` +
            `version of iframe-resizer than the parent page`,
        )
        return
      }

      if (width === 0 || height === 0) {
        log(id, 'Ignoring message with 0 height or width')
        return
      }

      // Recheck document.hidden here, as only Firefox
      // correctly supports this in the iframe
      if (document.hidden) {
        log(id, 'Page hidden - ignored resize request')
        return
      }

      resizeIframe(messageData)
  }
}
