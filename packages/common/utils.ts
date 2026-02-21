import { OBJECT, STRING } from './consts'

export const isElement = (node: Node): boolean => node.nodeType === Node.ELEMENT_NODE
export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value)
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === OBJECT && value !== null
export const isString = (value: unknown): value is string => typeof value === STRING

export const isSafari: boolean = /^((?!chrome|android).)*safari/i.test(
  navigator.userAgent,
)

export function isIframe(element: unknown): element is HTMLIFrameElement {
  if (!isObject(element)) return false

  try {
    return (element as unknown as HTMLElement).tagName === 'IFRAME' || element instanceof HTMLIFrameElement
  } catch (error) {
    return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

export const isolateUserCode = (func: AnyFunction, ...val: unknown[]): ReturnType<typeof setTimeout> =>
  setTimeout(() => func(...val), 0)

export const once = <T extends AnyFunction>(fn: T): T => {
  let done = false

  return function (this: unknown, ...args: unknown[]) {
    return done
      ? undefined
      : ((done = true), fn.apply(this, args))
  } as unknown as T
}

const hasOwnFallback = (o: object, k: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(o, k)

export const hasOwn = (o: object, k: PropertyKey): boolean =>
  Object.hasOwn ? Object.hasOwn(o, k) : hasOwnFallback(o, k)

export const isDarkModeEnabled = (): boolean =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export const id = <T>(x: T): T => x

const ROUNDING = 1000

export const round = (value: number): number => Math.round(value * ROUNDING) / ROUNDING

export const capitalizeFirstLetter = (string: string): string =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const isDef = (value: unknown): boolean => `${value}` !== '' && value !== undefined

export const invoke = <T>(fn: () => T): T => fn()

export const lower = (str: string): string => str.toLowerCase()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getElementName(el: any): string {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const esModuleInterop = <T = any>(mod: any): T =>
  // eslint-disable-next-line no-underscore-dangle
  mod?.__esModule ? mod.default : mod

export const typeAssert = (value: unknown, type: string, error: string): void => {
  // eslint-disable-next-line valid-typeof
  if (typeof value !== type) {
    throw new TypeError(`${error} is not a ${capitalizeFirstLetter(type)}`)
  }
}
