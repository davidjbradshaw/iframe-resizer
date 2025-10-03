import { NEW_LINE, STRING } from './consts'

const encode = (s) =>
  typeof s === STRING
    ? s
        .replaceAll('<br>', NEW_LINE)
        .replaceAll('<rb>', '\u001B[31;1m')
        .replaceAll('</>', '\u001B[m')
        .replaceAll('<b>', '\u001B[1m')
        .replaceAll('<i>', '\u001B[3m')
        .replaceAll('<u>', '\u001B[4m')
    : s

const remove = (s) =>
  typeof s === STRING
    ? s.replaceAll('<br>', NEW_LINE).replaceAll(/<[/a-z]+>/gi, '')
    : s

export default (formatLogMsg) => (msg) =>
  window.chrome // Only show formatting in Chrome as not supported in other browsers
    ? formatLogMsg(encode(msg))
    : formatLogMsg(remove(msg))
