import { FALSE, SEPARATOR, TRUE } from './consts'
import { isDef } from './type-check'

export const capitalizeFirstLetter = (string: string): string =>
  string.charAt(0).toUpperCase() + string.slice(1)

const ROUNDING = 1000

export const round = (value: number): number =>
  Math.round(value * ROUNDING) / ROUNDING

export const lower = (str: string): string => str.toLowerCase()

const BOOLEAN_STRINGS = new Set([TRUE, FALSE])

// Whether a message field is a boolean written as a string
export const isBooleanString = (value: string | undefined): boolean =>
  BOOLEAN_STRINGS.has(value)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getElementName(el: any): string {
  switch (true) {
    case !isDef(el):
      return ''

    case isDef(el.id):
      return `${el.nodeName}#${el.id}`

    case isDef(el.name):
      return `${el.nodeName} (${el.name})`

    case isDef(el.className):
      return `${el.nodeName}.${el.className}`

    default:
      return el.nodeName
  }
}

const hasOwnFallback = (o: object, k: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(o, k)

export const hasOwn = (o: object, k: PropertyKey): boolean =>
  Object.hasOwn ? Object.hasOwn(o, k) : hasOwnFallback(o, k)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const esModuleInterop = <T = any>(mod: any): T =>
  // eslint-disable-next-line no-underscore-dangle
  mod?.__esModule ? mod.default : mod

// The origin of a URL, or null when it is not an absolute URL
export const getOrigin = (url: string): string | null => {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

// A free-text field of a colon-separated message, with its colons escaped
// so it cannot shift the fields after it
const ESCAPED_SEPARATOR = '%3A'

export const escapeField = (value: unknown): string =>
  `${value ?? ''}`.split(SEPARATOR).join(ESCAPED_SEPARATOR)

export const unescapeField = (value: string): string =>
  value.split(ESCAPED_SEPARATOR).join(SEPARATOR)
