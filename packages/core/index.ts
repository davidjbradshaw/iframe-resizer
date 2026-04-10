import { LABEL } from '@iframe-resizer/common/consts'
import { isObject } from '@iframe-resizer/common/utils'

import ensureHasId from './checks/id'
import checkManualLogging from './checks/manual-logging'
import { errorBoundary, event as consoleEvent, warn } from './console'
import setupEventListenersOnce from './listeners'
import setupIframe from './setup'
import setupLogging from './setup/logging'
import type { IframeOptions } from './types'

export type {
  Direction,
  IframeComponent,
  IframeMessageData,
  IframeMouseData,
  IframeObject,
  IframeOptions,
  IframeResizedData,
  IframeScrollData,
  LogOption,
  MessageData,
  ScrollOption,
} from './types'
export {
  LOG_COLLAPSED,
  LOG_DISABLED,
  LOG_EXPANDED,
} from '@iframe-resizer/common/consts'

export default function connectResizer(
  options: IframeOptions,
): (iframe: HTMLIFrameElement) => any {
  if (!isObject(options)) throw new TypeError('Options is not an object')

  setupEventListenersOnce()
  checkManualLogging(options)

  return (iframe: HTMLIFrameElement) => {
    const id = ensureHasId(iframe, options)

    if (LABEL in iframe) {
      consoleEvent(id, 'alreadySetup')
      warn(id, `Ignored iframe (${id}), already setup.`)
    } else {
      setupLogging(id, options)
      errorBoundary(id, setupIframe)(iframe, options)
    }

    return iframe?.iframeResizer
  }
}
