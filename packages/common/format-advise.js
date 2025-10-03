import { NEW_LINE } from './consts'
import { isString } from './utils'

const encodeTags = (s) =>
  s
    .replaceAll('<br>', NEW_LINE)
    .replaceAll('<rb>', '\u001B[31;1m')
    .replaceAll('<bb>', '\u001B[34;1m')
    .replaceAll('</>', '\u001B[m')
    .replaceAll('<b>', '\u001B[1m')
    .replaceAll('<i>', '\u001B[3m')
    .replaceAll('<u>', '\u001B[4m')

const removeTags = (s) =>
  s.replaceAll('<br>', NEW_LINE).replaceAll(/<\/?[^>]+>/gi, '')

const encode = (s) => (isString(s) ? encodeTags(s) : s)
const remove = (s) => (isString(s) ? removeTags(s) : s)

export default (formatLogMsg) => (msg) =>
  window.chrome // Only show formatting in Chrome as not supported in other browsers
    ? formatLogMsg(encode(msg))
    : formatLogMsg(remove(msg))
