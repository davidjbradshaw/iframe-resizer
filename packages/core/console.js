import { createDeferConsole } from 'auto-group-console'

import { BOLD, TITLE } from '../common/consts'
import formatAdvise from '../common/format-advise'
import { id as identity } from '../common/utils'

let settings = {}
let logEnabled = false

export function setConsoleSettings(newSettings) {
  settings = newSettings
}

const getMyId = (iframeId) =>
  window.top === window.self
    ? `Parent page: ${iframeId}`
    : `Nested parent page: ${iframeId}`

const isLogEnabled = (iframeId) =>
  settings[iframeId] ? settings[iframeId].log : logEnabled

export function setupConsole({ enabled, iframeId }) {
  logEnabled = enabled
  settings[iframeId] = {
    console: createDeferConsole({
      title: `${TITLE}[${getMyId(iframeId)}]`,
    }),
  }
}

const output =
  (type) =>
  (iframeId, ...msg) =>
    settings[iframeId]?.console[type](...msg)

export const outputSwitched =
  (type) =>
  (iframeId, ...msg) =>
    isLogEnabled(iframeId) === true ? output(type)(iframeId, ...msg) : null

export const log = outputSwitched('log')
export const debug = outputSwitched('debug')
export const info = output('info')
export const warn = output('warn')
export const error = output('error')

export const vInfo = (msg) =>
  queueMicrotask(
    // eslint-disable-next-line no-console
    () => console.info(`%c[iframe-resizer] ${msg}`, BOLD),
  )

const formatLogMsg =
  (iframeId) =>
  (...msg) =>
    [`${TITLE}[${iframeId}]`, ...msg].join(' ')

export const advise = (iframeId, msg) =>
  settings[iframeId]
    ? settings[iframeId].console.warn(formatAdvise(identity)(msg))
    : queueMicrotask(
        // eslint-disable-next-line no-console
        () => console?.warn(formatAdvise(formatLogMsg(iframeId))(msg)),
      )
