import { createDeferConsole } from 'auto-group-console'

import { BOLD, TITLE } from '../common/consts'
import formatAdvise from '../common/format-advise'
import { id as identity } from '../common/utils'

let settings = {}
let logEnabled = false

export function setConsoleSettings(newSettings) {
  settings = newSettings
}

function getMyId(iframeId) {
  if (window.top === window.self) {
    return `Parent page: ${iframeId}`
  }

  return window?.parentIframe?.getId
    ? `${window.parentIframe.getId()}: ${iframeId}`
    : `Nested parent page: ${iframeId}`
}

const isLogEnabled = (iframeId) =>
  settings[iframeId] ? settings[iframeId].log : logEnabled

function setupConsole(iframeId) {
  settings[iframeId] = {
    console: createDeferConsole({
      title: `${TITLE}[${getMyId(iframeId)}]`,
    }),
  }
}

export function setupLogging({ enabled, iframeId }) {
  logEnabled = enabled
  setupConsole(iframeId)
}

const formatLogMsg =
  (iframeId) =>
  (...msg) =>
    [`${TITLE}[${iframeId}]`, ...msg].join(' ')

const output =
  (type) =>
  (iframeId, ...msg) =>
    settings[iframeId]?.console[type](...msg)

export const log = (iframeId, ...msg) =>
  isLogEnabled(iframeId) === true ? output('log')(iframeId, ...msg) : null

export const info = output('info')
export const warn = output('warn')
export const error = output('error')

export const vInfo = (msg) =>
  queueMicrotask(
    // eslint-disable-next-line no-console
    () => console.info(`%c[iframe-resizer] ${msg}`, BOLD),
  )

export const advise = (iframeId, msg) =>
  settings[iframeId]
    ? settings[iframeId].console.warn(formatAdvise(identity)(msg))
    : queueMicrotask(
        // eslint-disable-next-line no-console
        () => console?.warn(formatAdvise(formatLogMsg(iframeId))(msg)),
      )
