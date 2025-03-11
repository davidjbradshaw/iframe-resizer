import { createDeferConsole } from 'auto-group-console'

import { TITLE } from '../common/consts'
import deprecate from '../common/deprecate'
import formatAdvise from '../common/format-advise'
import { id as identity } from '../common/utils'

const childConsole = createDeferConsole({ title: `${TITLE}(child)` })

export function setConsoleOptions(options) {
  childConsole.setTitle(`${TITLE}(child) ${options.id}`)
}

export const { assert, debug, log, info, warn } = childConsole

export const advise = (...msg) =>
  childConsole.warn(formatAdvise(identity)(...msg))

export const adviser = advise

const deprecateAdvise = deprecate((id, ...msg) => advise(...msg))
export const deprecateMethod = deprecateAdvise('Method')
export const deprecateMethodReplace = deprecateAdvise('Method', 'replaced with')
export const deprecateOption = deprecateAdvise('Option')
