import { INIT, SEPARATOR } from '../../common/consts'
import sendMessage from '../send/message'
import { isInitMessage } from './is'

const { freeze } = Object
export const { parse } = JSON
export const parseFrozen = (data: string): any => freeze(parse(data))

export const notExpected = (type: string): void => sendMessage(0, 0, `${type}Stop`)

export const getData = (event: MessageEvent): string =>
  event.data.slice(event.data.indexOf(SEPARATOR) + 1)

export const getMessageType = (event: MessageEvent): string =>
  isInitMessage(event) ? INIT : event.data.split(']')[1].split(SEPARATOR)[0]
