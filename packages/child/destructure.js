import { id } from '../common/utils'

const strBool = (str) => str === 'true'

const destructure = (cast) => (data) =>
  undefined === data ? undefined : cast(data)

export const getBoolean = destructure(strBool)
export const getNumber = destructure(Number)
export const getString = destructure(id)
