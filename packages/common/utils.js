export const isNumber = (value) => !Number.isNaN(value)

export const once = (fn) => {
  let done = false

  return function () {
    return done
      ? undefined
      : ((done = true), Reflect.apply(fn, this, arguments))
  }
}

export const id = (x) => x

const ROUNDING = 100_000

export const round = (value) => Math.round(value * ROUNDING) / ROUNDING

export const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

const isDef = (value) => `${value}` !== '' && value !== undefined

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
