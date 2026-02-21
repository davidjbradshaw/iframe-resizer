import { MESSAGE_HEADER_LENGTH, SEPARATOR } from '../../common/consts'
import settings from '../values/settings'

export default function getMessageBody(id: string, offset: number): string {
  const { lastMessage } = settings[id]
  return lastMessage.slice(
    lastMessage.indexOf(SEPARATOR) + MESSAGE_HEADER_LENGTH + offset,
  )
}
