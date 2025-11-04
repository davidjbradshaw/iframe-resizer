import { SEPARATOR } from '../../common/consts'
import sendMessage from '../send/message'

const { freeze } = Object
export const { parse } = JSON
export const parseFrozen = (data) => freeze(parse(data))

export const notExpected = (type) => sendMessage(0, 0, `${type}Stop`)

export const getData = (event) =>
  event.data.slice(event.data.indexOf(SEPARATOR) + 1)
