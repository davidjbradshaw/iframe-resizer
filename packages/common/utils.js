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
