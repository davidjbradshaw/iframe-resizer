import formatAdvise from '../common/format-advise'

let id = ''
let logging = false

export const setLogOptions = (options) => {
  id = options.id
  logging = options.logging
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

const BOLD = 'font-weight: bold;'
const NORMAL = 'font-weight: normal;'

// TODO: remove .join(' '), requires major test updates
const formatLogMsg = (...msg) =>
  [`[iframe-resizer][${id || 'child'}]`, ...msg].join(' ')

export const log = (...msg) =>
  // eslint-disable-next-line no-console
  logging && console?.log(formatLogMsg(...msg))

// eslint-disable-next-line no-unused-vars
export const info = (...msg) =>
  // eslint-disable-next-line no-console
  logging && console?.info(`%c[iframe-resizer][${id}]%c`, BOLD, NORMAL, ...msg)

export const warn = (...msg) =>
  // eslint-disable-next-line no-console
  console?.warn(formatLogMsg(...msg))

export const advise = (...msg) =>
  // eslint-disable-next-line no-console
  console?.warn(formatAdvise(formatLogMsg)(...msg))

export const adviser = (msg) => advise(msg)

const deprecate =
  (type, change = 'renamed to') =>
  (old, replacement) =>
    advise(
      `<rb>Deprecated ${type}</>\n\nThe <b>${old}</> ${type.toLowerCase()} has been ${change} <b>${replacement}</>. Use of the old ${type.toLowerCase()} will be removed in a future version of <i>iframe-resizer</>.`,
    )

export const deprecateAttr = deprecate('Attribute')
export const deprecateMethod = deprecate('Method', 'replaced with')
export const deprecateOption = deprecate('Option')
