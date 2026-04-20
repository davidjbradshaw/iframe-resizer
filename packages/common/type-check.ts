import { OBJECT, STRING } from './consts'

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === OBJECT && value !== null
export const isString = (value: unknown): value is string =>
  typeof value === STRING

export function isIframe(element: unknown): element is HTMLIFrameElement {
  if (!isObject(element)) return false

  try {
    return (
      (element as unknown as HTMLElement).tagName === 'IFRAME' ||
      element instanceof HTMLIFrameElement
    )
  } catch (error) {
    return false
  }
}

export const isDef = (value: unknown): boolean =>
  `${value}` !== '' && value !== undefined

export const typeAssert = (
  value: unknown,
  type: string,
  error: string,
): void => {
  // eslint-disable-next-line valid-typeof
  if (typeof value !== type) {
    throw new TypeError(
      `${error} is not a ${type.charAt(0).toUpperCase()}${type.slice(1)}`,
    )
  }
}
