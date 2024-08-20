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

// function elementSnippet(el, maxChars = 30) {
//   const outer = el?.outerHTML?.toString()

//   if (!outer) return el

//   return outer.length < maxChars
//     ? outer
//     : `${outer.slice(0, maxChars).replaceAll('\n', ' ')}...`
// }

// TODO: remove .join(' '), requires major test updates
const formatLogMsg = (...msg) =>
  [`[iframe-resizer][${id || 'child'}]`, ...msg].join(' ')

export const log = (...msg) =>
  // eslint-disable-next-line no-console
  logging && console?.log(formatLogMsg(...msg))

// eslint-disable-next-line no-unused-vars
export const info = (...msg) =>
  // eslint-disable-next-line no-console
  console?.info(`[iframe-resizer][${id}]`, ...msg)

export const warn = (...msg) =>
  // eslint-disable-next-line no-console
  console?.warn(formatLogMsg(...msg))

export const advise = (...msg) =>
  // eslint-disable-next-line no-console
  console?.warn(formatAdvise(formatLogMsg)(...msg))

export const adviser = (msg) => advise(msg)
