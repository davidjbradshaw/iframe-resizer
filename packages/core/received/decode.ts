import { MESSAGE_ID_LENGTH } from '../../common/consts'
import type { MessageData } from '../types'
import settings from '../values/settings'

export function getPaddingEnds(compStyle: CSSStyleDeclaration): number {
  if (compStyle.boxSizing !== 'border-box') return 0

  const top = compStyle.paddingTop ? parseInt(compStyle.paddingTop, 10) : 0
  const bot = compStyle.paddingBottom
    ? parseInt(compStyle.paddingBottom, 10)
    : 0

  return top + bot
}

export function getBorderEnds(compStyle: CSSStyleDeclaration): number {
  if (compStyle.boxSizing !== 'border-box') return 0

  const top = compStyle.borderTopWidth
    ? parseInt(compStyle.borderTopWidth, 10)
    : 0

  const bot = compStyle.borderBottomWidth
    ? parseInt(compStyle.borderBottomWidth, 10)
    : 0

  return top + bot
}

export default function decodeMessage(msg: string): MessageData {
  const data = msg.slice(MESSAGE_ID_LENGTH).split(':')
  const height = data[1] ? Number(data[1]) : 0
  const iframe = settings[data[0]]?.iframe
  const compStyle = getComputedStyle(iframe)

  const messageData: MessageData = {
    iframe,
    id: data[0],
    height: height + getPaddingEnds(compStyle) + getBorderEnds(compStyle),
    width: Number(data[2]),
    type: data[3],
    msg: data[4],
    message: data[4],
  }

  // eslint-disable-next-line prefer-destructuring
  if (data[5]) messageData.mode = data[5]

  return messageData
}
