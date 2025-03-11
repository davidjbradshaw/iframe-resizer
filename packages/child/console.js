import { createDeferConsole } from 'auto-group-console'

import { TITLE } from '../common/consts'
import deprecate from '../common/deprecate'
import formatAdvise from '../common/format-advise'
import { id as identity } from '../common/utils'

let enabled = true

const childConsole = createDeferConsole({ title: `${TITLE}(child)` })

export function setConsoleOptions(options) {
  childConsole.setTitle(`${TITLE}(child) ${options.id}`)
  enabled = options.enabled
}

export const setupConsoleMethod = (method) => (...msg) =>
  !enabled ? true : childConsole[method](...msg)

export const log = setupConsoleMethod('log')
export const info = setupConsoleMethod('info')

export const { assert, debug, error, warn } = childConsole

export const advise = (...msg) =>
  childConsole.warn(formatAdvise(identity)(...msg))

export const adviser = advise

const deprecateAdvise = deprecate((id, ...msg) => advise(...msg))
export const deprecateMethod = deprecateAdvise('Method')
export const deprecateMethodReplace = deprecateAdvise('Method', 'replaced with')
export const deprecateOption = deprecateAdvise('Option')
