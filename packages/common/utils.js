import { OBJECT, STRING } from './consts'

export const isElement = (node) => node.nodeType === Node.ELEMENT_NODE
export const isNumber = (value) => !Number.isNaN(value)
export const isObject = (value) => typeof value === OBJECT && value !== null
export const isString = (value) => typeof value === STRING

export const isSafari = /^((?!chrome|android).)*safari/i.test(
  navigator.userAgent,
)

export function isIframe(element) {
  if (!isObject(element)) return false

  try {
    return element.tagName === 'IFRAME' || element instanceof HTMLIFrameElement
  } catch (error) {
    return false
  }
}

export const isolateUserCode = (func, ...val) =>
  setTimeout(() => func(...val), 0)

export const once = (fn) => {
  let done = false

  return function () {
    return done
      ? undefined
      : ((done = true), Reflect.apply(fn, this, arguments))
  }
}

export const hasOwn =
  Object.hasOwn || ((o, k) => Object.prototype.hasOwnProperty.call(o, k))

export const isDarkModeEnabled = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export const id = (x) => x

const ROUNDING = 1000

export const round = (value) => Math.round(value * ROUNDING) / ROUNDING

export const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const isDef = (value) => `${value}` !== '' && value !== undefined

export const invoke = (fn) => fn()

export const lower = (str) => str.toLowerCase()

export function getElementName(el) {
  switch (true) {
    case !isDef(el):
      return ''

    case isDef(el.id):
      return `${el.nodeName}#${el.id}`

    case isDef(el.name):
      return `${el.nodeName} (${el.name}`

    case isDef(el.className):
      return `${el.nodeName}.${el.className}`

    default:
      return el.nodeName
  }
}

export const esModuleInterop = (mod) =>
  // eslint-disable-next-line no-underscore-dangle
  mod?.__esModule ? mod.default : mod

export const typeAssert = (value, type, error) => {
  // eslint-disable-next-line valid-typeof
  if (typeof value !== type) {
    throw new TypeError(`${error} is not a ${capitalizeFirstLetter(type)}`)
  }
}
