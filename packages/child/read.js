const read = (type) => (data, key) => {
  if (!(key in data)) return
  // eslint-disable-next-line valid-typeof, consistent-return
  if (typeof data[key] === type) return data[key]

  throw new TypeError(`${key} is not a ${type}.`)
}

export const readFunction = read('function')
export const readBoolean = read('boolean')
export const readNumber = read('number')
export const readString = read('string')
