import createGroupConsole from 'auto-group-console'

import { LABEL } from '../common/consts'
import deprecate from '../common/deprecate'
import formatAdvise from '../common/format-advise'
import { id as identity } from '../common/utils'

let enabled = true

const childConsole = createGroupConsole({ label: `${LABEL}(child)` })

export function setConsoleOptions(options) {
  childConsole.label(`${options.id}`)
  enabled = options.enabled
}

export const setupConsoleMethod =
  (method) =>
  (...msg) =>
    enabled ? childConsole[method](...msg) : true

export const log = setupConsoleMethod('log')
export const info = setupConsoleMethod('info')

export const { event, assert, debug, endAutoGroup, error, warn } = childConsole

export const purge = () => childConsole.purge()

export const advise = (...msg) =>
  childConsole.warn(formatAdvise(identity)(...msg))

export const adviser = advise

const deprecateAdvise = deprecate((id, ...msg) => advise(...msg))
export const deprecateMethod = deprecateAdvise('Method')
export const deprecateMethodReplace = deprecateAdvise('Method', 'replaced with')
export const deprecateOption = deprecateAdvise('Option')
