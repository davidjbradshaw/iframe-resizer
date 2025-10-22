import { isString } from '../../common/utils'
import { event as consoleEvent, log } from '../console'
import defaults from '../values/defaults'

let count = 0

function newId(options) {
  let id = options?.id || defaults.id + count++

  if (document.getElementById(id) !== null) {
    id += count++
  }

  return id
}

export default function ensureHasId(iframe, options) {
  let { id } = iframe

  if (id && !isString(id)) {
    throw new TypeError('Invalid id for iFrame. Expected String')
  }

  if (!id || id === '') {
    id = newId(options)
    iframe.id = id
    consoleEvent(id, 'assignId')
    log(id, `Added missing iframe ID: ${id} (${iframe.src})`)
  }

  return id
}
