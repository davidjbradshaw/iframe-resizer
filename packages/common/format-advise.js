/* eslint-disable no-useless-escape */
/* eslint-disable security/detect-non-literal-regexp */

import { NEW_LINE } from './consts'
import { isString } from './utils'

const TAGS = {
  br: '\n',
  rb: '\u001B[31;1m', // red bold
  bb: '\u001B[34;1m', // blue bold
  b: '\u001B[1m', // bold
  i: '\u001B[3m', // italic
  u: '\u001B[4m', // underline
  '/': '\u001B[m', // reset
}

// <tag> where tag is one of our keys
const tags = new RegExp(
  `<(\/|${Object.keys(TAGS)
    .filter((tag) => tag !== '/')
    .join('|')})>`,
  'gi',
)

const lookup = (_, name) => TAGS[name] ?? ''

const encode = (s) => s.replace(tags, lookup)

const filter = (s) =>
  s.replaceAll('<br>', NEW_LINE).replaceAll(/<\/?[^>]+>/gi, '')

const ifString = (process) => (s) => (isString(s) ? process(s) : s)

// Chrome shows ANSI; others get plain text
export default (formatLogMessage) => (message) =>
  formatLogMessage(
    window.chrome ? ifString(encode)(message) : ifString(filter)(message),
  )

/* eslint-enable security/detect-non-literal-regexp */
/* eslint-enable no-useless-escape */
