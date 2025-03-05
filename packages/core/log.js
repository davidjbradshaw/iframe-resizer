import { createDeferConsole } from 'auto-group-console'

import { BOLD, TITLE } from '../common/consts'
import formatAdvise from '../common/format-advise'
import { id as identity } from '../common/utils'

let settings = {}
let logEnabled = false

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

export function setLogSettings(newSettings) {
  settings = newSettings
}

const formatLogMsg =
  (iframeId) =>
  (...msg) =>
    [`${TITLE}[${iframeId}]`, ...msg].join(' ')

const output = (type, iframeId, ...msg) =>
  settings[iframeId]?.console[type](...msg)

export const log = (iframeId, ...msg) =>
  isLogEnabled(iframeId) === true ? output('log', iframeId, ...msg) : null

export const info = (iframeId, ...msg) => output('info', iframeId, ...msg)
export const warn = (iframeId, ...msg) => output('warn', iframeId, ...msg)
export const error = (iframeId, ...msg) => output('error', iframeId, ...msg)

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
