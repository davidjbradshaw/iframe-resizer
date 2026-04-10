import { BOLD, LABEL } from '@iframe-resizer/common/consts'
import deprecate from '@iframe-resizer/common/deprecate'
import createFormatAdvise from '@iframe-resizer/common/format-advise'
import { esModuleInterop, id as identity } from '@iframe-resizer/common/utils'
import acg, { NORMAL } from 'auto-console-group'

let enabled = true
let id = LABEL

// Deal with UMD not converting default exports to named exports
const createGroupConsole = esModuleInterop(acg)

const childConsole = createGroupConsole({
  label: `${LABEL}(child)`,
  expand: false,
})

export function setConsoleOptions(options: {
  id?: string
  enabled: boolean
  expand: boolean
}): void {
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
  console.info(`%ciframe-resizer ${ver}`, enabled || mode < 1 ? BOLD : NORMAL)
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
export const advise = (...args: any[]): void =>
  childConsole.warn(...args.map(formatAdvise))
export const adviseNow = (...args: any[]): void =>
  // eslint-disable-next-line no-console
  console.warn(...args.map(formatAdvise))

const deprecateAdvise = deprecate((_, msg) => advise(msg))
export const deprecateMethod = deprecateAdvise('Method')
export const deprecateMethodReplace = deprecateAdvise('Method', 'replaced with')
export const deprecateOption = deprecateAdvise('Option')
