import acg, { NORMAL } from 'auto-console-group'

import { BOLD, LABEL } from '../common/consts'
import deprecate from '../common/deprecate'
import createFormatAdvise from '../common/format-advise'
import { esModuleInterop, id as identity } from '../common/utils'

let enabled = true
let id = LABEL

// Deal with UMD not converting default exports to named exports
const createGroupConsole = esModuleInterop(acg)

const childConsole = createGroupConsole({
  label: `${LABEL}(child)`,
  expand: false,
})

export function setConsoleOptions(options: { id?: string; enabled: boolean; expand: boolean }): void {
  id = options.id || LABEL
  childConsole.label(`${id}`)
  childConsole.expand(options.expand)
  enabled = options.enabled
}

export const setupConsoleMethod =
  (method: string) =>
  (...args: any[]) =>
    enabled ? childConsole[method](...args) : true

export const log = setupConsoleMethod('log')
export const info = log // setupConsoleMethod('info')
export const debug = setupConsoleMethod('debug')

export function vInfo(ver: string, mode: number): void {
  // eslint-disable-next-line no-console
  console.info(
    `${id} %ciframe-resizer ${ver}`,
    enabled || mode < 1 ? BOLD : NORMAL,
  )
}

export const {
  assert,
  endAutoGroup,
  error,
  errorBoundary,
  event,
  label,
  purge,
  warn,
} = childConsole

const formatAdvise = createFormatAdvise(identity)
export const advise = (...args: any[]): void => childConsole.warn(...args.map(formatAdvise))

const deprecateAdvise = deprecate((id, msg) => advise(msg))
export const deprecateMethod = deprecateAdvise('Method')
export const deprecateMethodReplace = deprecateAdvise('Method', 'replaced with')
export const deprecateOption = deprecateAdvise('Option')
