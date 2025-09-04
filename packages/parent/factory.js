import connectResizer from '@iframe-resizer/core'

import { LABEL, OBJECT, STRING, UNDEFINED } from '../common/consts'

const id = `[${LABEL}] `

export default function createIframeResize() {
  function setup(element) {
    switch (true) {
      case !element:
        throw new TypeError(`${id}iframe is not defined`)

      case !element.tagName:
        throw new TypeError(`${id}Not a valid DOM element`)

      case element.tagName.toUpperCase() !== 'IFRAME':
        throw new TypeError(
          `${id}Expected <IFRAME> tag, found <${element.tagName}>`,
        )

      default:
        connectWithOptions(element)
        iFrames.push(element)
    }
  }

  let connectWithOptions
  let iFrames

  return function (options, target) {
    if (typeof window === UNDEFINED) return [] // don't run for server side render

    connectWithOptions = connectResizer(options)
    iFrames = [] // Only return iFrames passed in on this call

    switch (typeof target) {
      case UNDEFINED:
      case STRING:
        document.querySelectorAll(target || 'iframe').forEach(setup)
        break

      case OBJECT:
        setup(target)
        break

      default:
        throw new TypeError(`${id}Unexpected data type (${typeof target})`)
    }

    return Object.freeze(iFrames)
  }
}
