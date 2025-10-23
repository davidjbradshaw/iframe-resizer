import { LABEL, OBJECT } from '../common/consts'
import ensureHasId from './checks/id'
import checkManualLogging from './checks/manual-logging'
import { errorBoundary, warn } from './console'
import setupEventListenersOnce from './listeners'
import setupIframe from './setup'
import startLogging from './setup/logging'

export default (options) => (iframe) => {
  const id = ensureHasId(iframe, options)

  if (typeof options !== OBJECT) {
    throw new TypeError('Options is not an object')
  }

  if (LABEL in iframe) return warn(id, `Ignored iframe (${id}), already setup.`)

  checkManualLogging(options)
  startLogging(id, options)
  setupEventListenersOnce()
  errorBoundary(id, setupIframe)(iframe, options)

  return iframe?.iframeResizer
}
