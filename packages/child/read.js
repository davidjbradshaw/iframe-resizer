const read = (type) => (data, key, defaultValue) => {
  if (!(key in data)) return defaultValue
  // eslint-disable-next-line valid-typeof
  if (typeof data[key] === type) return data[key]

  throw new TypeError(`${key} is not a ${type}.`)
}

export const readFunction = read('function')
export const readBoolean = read('boolean')
export const readNumber = read('number')
export const readString = read('string')
