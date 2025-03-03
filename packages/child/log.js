import formatAdvise from '../common/format-advise'
import MicroConsole from '../common/micro-console'
import { id as identity } from '../common/utils'

const childConsole = MicroConsole('child')

export function setLogOptions(options) {
  childConsole.setId(options.id)
  childConsole.setLogging(options.logging)
}

export const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

const isDef = (value) => `${value}` !== '' && value !== undefined

export function getElementName(el) {
  switch (true) {
    case !isDef(el):
      return ''

    case isDef(el.id):
      return `${el.nodeName.toUpperCase()}#${el.id}`

    case isDef(el.name):
      return `${el.nodeName.toUpperCase()} (${el.name})`

    default:
      return (
        el.nodeName.toUpperCase() +
        (isDef(el.className) ? `.${el.className}` : '')
      )
  }
}

export const { log, info, warn } = childConsole

export const advise = (...msg) =>
  childConsole.warn(formatAdvise(identity)(...msg))

export const adviser = (msg) => advise(msg)

const deprecate =
  (type, change = 'renamed to') =>
  (old, replacement, info = '') =>
    advise(
      `<rb>Deprecated ${type} (${old})</>\n\nThe <b>${old}</> ${type.toLowerCase()} has been ${change} <b>${replacement}</>. ${info}Use of the old ${type.toLowerCase()} will be removed in a future version of <i>iframe-resizer</>.`,
    )

export const deprecateMethod = deprecate('Method')
export const deprecateMethodReplace = deprecate('Method', 'replaced with')
export const deprecateOption = deprecate('Option')
