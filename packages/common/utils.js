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

export const time = () => {
  const time = new Date()
  return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}.${time.getMilliseconds()}`
}
