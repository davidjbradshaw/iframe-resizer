import { LABEL } from '../common/consts'
import { isObject } from '../common/utils'
import ensureHasId from './checks/id'
import checkManualLogging from './checks/manual-logging'
import { errorBoundary, warn } from './console'
import setupEventListenersOnce from './listeners'
import setupIframe from './setup'
import startLogging from './setup/logging'

export default function connectResizer(options) {
  if (!isObject(options)) throw new TypeError('Options is not an object')

  setupEventListenersOnce()
  checkManualLogging(options)

  return (iframe) => {
    const id = ensureHasId(iframe, options)

    if (LABEL in iframe) {
      warn(id, `Ignored iframe (${id}), already setup.`)
    } else {
      startLogging(id, options)
      errorBoundary(id, setupIframe)(iframe, options)
    }

    return iframe?.iframeResizer
  }
}
