import { MESSAGE_HEADER_LENGTH } from '../common/consts'

// eslint-disable-next-line import/prefer-default-export
export const getMessageBody = (message, offset) =>
  message.slice(message.indexOf(':') + MESSAGE_HEADER_LENGTH + offset)
