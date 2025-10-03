import { NEW_LINE } from './consts'
import { isString } from './utils'

const encode = (s) =>
  s
    .replaceAll('<br>', NEW_LINE)
    .replaceAll('<rb>', '\u001B[31;1m')
    .replaceAll('<bb>', '\u001B[34;1m')
    .replaceAll('</>', '\u001B[m')
    .replaceAll('<b>', '\u001B[1m')
    .replaceAll('<i>', '\u001B[3m')
    .replaceAll('<u>', '\u001B[4m')

const filter = (s) =>
  s.replaceAll('<br>', NEW_LINE).replaceAll(/<\/?[^>]+>/gi, '')

const ifString = (process) => (s) => (isString(s) ? process(s) : s)

export default (formatLogMessage) => (message) =>
  // Only show formatting in Chrome as not supported in other browsers
  formatLogMessage(
    window.chrome ? ifString(encode)(message) : ifString(filter)(message),
  )
