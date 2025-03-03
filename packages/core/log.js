import { BOLD } from '../common/consts'
import formatAdvise from '../common/format-advise'
import microLog from '../common/micro-log'

const msgId = '[iframe-resizer]'

let settings = {}
let logEnabled = false

function getMyId(iframeId) {
  if (window.top === window.self) {
    return `Parent page: ${iframeId}`
  }

  return window?.parentIFrame?.getId
    ? `${window.parentIFrame.getId()}: ${iframeId}`
    : `Nested parent page: ${iframeId}`
}

const isLogEnabled = (iframeId) =>
  settings[iframeId] ? settings[iframeId].log : logEnabled

function setupMicroLog(iframeId) {
  const newLog = microLog()

  newLog.setId(getMyId(iframeId))
  newLog.setLogging(true)

  settings[iframeId] = {}
  settings[iframeId].microLog = newLog
}

export function setupLogging({ enabled, iframeId }) {
  logEnabled = enabled
  setupMicroLog(iframeId)
}

export function setLogSettings(newSettings) {
  settings = newSettings
}

const formatLogMsg =
  (iframeId) =>
  (...msg) =>
    [`${msgId}[${iframeId}]`, ...msg].join(' ')

const output = (type, iframeId, ...msg) =>
  settings[iframeId].microLog.add(type, ...msg)

export const log = (iframeId, ...msg) =>
  isLogEnabled(iframeId) === true ? output('log', iframeId, ...msg) : null

export const info = (iframeId, ...msg) => output('info', iframeId, ...msg)

export const vInfo = (msg) =>
  // eslint-disable-next-line no-console
  console.info(`%c[iframe-resizer] ${msg}`, BOLD)

export const warn = (iframeId, ...msg) => output('warn', iframeId, ...msg)

export const advise = (iframeId, msg) =>
  settings[iframeId]
    ? settings[iframeId].microLog.add('warn', formatAdvise((x) => x)(msg))
    : // eslint-disable-next-line no-console
      console?.warn(formatAdvise(formatLogMsg(iframeId))(msg))
