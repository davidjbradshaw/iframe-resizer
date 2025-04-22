const strBool = (str) => str === 'true'

const castDefined = (cast) => (data) =>
  undefined === data ? undefined : cast(data)

export const getBoolean = castDefined(strBool)
export const getNumber = castDefined(Number)
