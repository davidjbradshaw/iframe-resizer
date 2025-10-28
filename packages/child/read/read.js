import { BOOLEAN, FUNCTION, NUMBER, STRING } from '../../common/consts'

const read = (type) => (data, key) => {
  if (!(key in data)) return
  // eslint-disable-next-line valid-typeof, consistent-return
  if (typeof data[key] === type) return data[key]

  throw new TypeError(`${key} is not a ${type}.`)
}

export const readFunction = read(FUNCTION)
export const readBoolean = read(BOOLEAN)
export const readNumber = read(NUMBER)
export const readString = read(STRING)
