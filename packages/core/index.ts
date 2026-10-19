import { isObject } from '@iframe-resizer/common'

import checkBoundId from './checks/bound-id'
import ensureHasId from './checks/id'
import checkManualLogging from './checks/manual-logging'
import { errorBoundary } from './console'
import setupEventListenersOnce from './listeners'
import setupIframe from './setup'
import setupLogging from './setup/logging'
import updateIframe from './setup/update'
import type { IFrameComponent, IFrameObject, IFrameOptions } from './types'
import settings from './values/settings'

export type * from './types'
export {
  LOG_COLLAPSED,
  LOG_DISABLED,
  LOG_EXPANDED,
} from '@iframe-resizer/common/consts'

function updateBoundIframe(
  iframe: HTMLIFrameElement,
  options: IFrameOptions,
): void {
  checkBoundId(iframe)
  updateIframe(iframe, options)
}

// Bound while core holds settings for it; its methods can outlive that
const isBound = (iframe: HTMLIFrameElement): boolean =>
  Object.values(settings).some((entry) => entry.iframe === iframe)

export default function connectResizer(
  options: IFrameOptions,
): (iframe: HTMLIFrameElement) => IFrameObject | undefined {
  if (!isObject(options)) throw new TypeError('Options is not an object')

  setupEventListenersOnce()
  checkManualLogging(options)

  return (iframe: HTMLIFrameElement) => {
    const id = ensureHasId(iframe, options)

    if (isBound(iframe)) {
      errorBoundary(id, updateBoundIframe)(iframe, options)
    } else {
      setupLogging(id, options)
      errorBoundary(id, setupIframe)(iframe, options)
    }

    return (iframe as IFrameComponent).iframeResizer
  }
}
