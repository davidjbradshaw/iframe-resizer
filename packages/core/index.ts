import { isObject } from '@iframe-resizer/common'
import { LABEL } from '@iframe-resizer/common/consts'

import ensureHasId from './checks/id'
import checkManualLogging from './checks/manual-logging'
import { errorBoundary } from './console'
import setupEventListenersOnce from './listeners'
import setupIframe from './setup'
import setupLogging from './setup/logging'
import updateIframe from './setup/update'
import type { IFrameComponent, IFrameObject, IFrameOptions } from './types'

export type * from './types'
export {
  LOG_COLLAPSED,
  LOG_DISABLED,
  LOG_EXPANDED,
} from '@iframe-resizer/common/consts'

export default function connectResizer(
  options: IFrameOptions,
): (iframe: HTMLIFrameElement) => IFrameObject | undefined {
  if (!isObject(options)) throw new TypeError('Options is not an object')

  setupEventListenersOnce()
  checkManualLogging(options)

  return (iframe: HTMLIFrameElement) => {
    const id = ensureHasId(iframe, options)

    if (LABEL in iframe) {
      errorBoundary(id, updateIframe)(iframe, options)
    } else {
      setupLogging(id, options)
      errorBoundary(id, setupIframe)(iframe, options)
    }

    return (iframe as IFrameComponent).iframeResizer
  }
}
