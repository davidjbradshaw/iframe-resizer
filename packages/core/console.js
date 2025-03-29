import acg, { NORMAL } from 'auto-console-group'

import { BOLD, LABEL } from '../common/consts'
import deprecate from '../common/deprecate'
import formatAdvise from '../common/format-advise'
import { esModuleInterop, id as identity } from '../common/utils'

// Deal with UMD not converting default exports to named exports
const createConsoleGroup = esModuleInterop(acg)

let settings = {}
let consoleEnabled = false

export function setConsoleSettings(newSettings) {
  settings = newSettings
}

const getMyId = (iframeId) =>
  window.top === window.self
    ? `parent(${iframeId})`
    : `nested parent(${iframeId})`

const isLogEnabled = (iframeId) =>
  settings[iframeId] ? settings[iframeId].log : consoleEnabled

export function setupConsole({ enabled, iframeId }) {
  const consoleGroup = createConsoleGroup({
    label: getMyId(iframeId),
  })

  consoleEnabled = enabled

  if (!settings[iframeId])
    settings[iframeId] = {
      console: consoleGroup,
      errorBoundary: consoleGroup.errorBoundary,
    }
}

const output =
  (type) =>
  (iframeId, ...args) =>
    settings[iframeId]?.console[type](...args)

export const outputSwitched =
  (type) =>
  (iframeId, ...args) =>
    isLogEnabled(iframeId) === true ? output(type)(iframeId, ...args) : null

export const log = outputSwitched('log')
export const info = outputSwitched('info')
export const warn = output('warn')
export const error = output('error')
export const event = output('event')
export const debug = outputSwitched('debug')
export const endAutoGroup = output('endAutoGroup')

export function vInfo(version, mode) {
  if (!('iframeResizer' in window)) window.iframeResizer = { version }
  queueMicrotask(
    // eslint-disable-next-line no-console
    () =>
      console.info(
        `%ciframe-resizer ${version}`,
        consoleEnabled || mode < 1 ? BOLD : NORMAL,
      ),
  )
}

const formatLogMsg =
  (iframeId) =>
  (...args) =>
    [`${LABEL}(${iframeId})`, ...args].join(' ')

export const advise = (iframeId, ...args) =>
  settings[iframeId]
    ? settings[iframeId].console.warn(formatAdvise(identity)(...args))
    : queueMicrotask(
        // eslint-disable-next-line no-console
        () => console?.warn(formatAdvise(formatLogMsg(iframeId))(...args)),
      )

const deprecateAdvise = deprecate(advise)
export const deprecateFunction = deprecateAdvise('Function')
export const deprecateMethod = deprecateAdvise('Method')
export const deprecateOption = deprecateAdvise('Option')
