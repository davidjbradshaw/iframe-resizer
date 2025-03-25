import acg from 'auto-console-group'

import { LABEL } from '../common/consts'
import deprecate from '../common/deprecate'
import formatAdvise from '../common/format-advise'
import { esModuleInterop, id as identity } from '../common/utils'

let enabled = true

// Deal with UMD not converting default exports to named exports
const createGroupConsole = esModuleInterop(acg)

const childConsole = createGroupConsole({ label: `${LABEL}(child)` })

export function setConsoleOptions(options) {
  childConsole.label(`${options.id}`)
  enabled = options.enabled
}

export const setupConsoleMethod =
  (method) =>
  (...args) =>
    enabled ? childConsole[method](...args) : true

export const log = setupConsoleMethod('log')
export const info = setupConsoleMethod('info')

export const { event, assert, debug, endAutoGroup, error, purge, warn } =
  childConsole

export const advise = (...args) =>
  childConsole.warn(formatAdvise(identity)(...args))

export const adviser = advise

const deprecateAdvise = deprecate((id, ...args) => advise(...args))
export const deprecateMethod = deprecateAdvise('Method')
export const deprecateMethodReplace = deprecateAdvise('Method', 'replaced with')
export const deprecateOption = deprecateAdvise('Option')
