import connectResizer from '@iframe-resizer/core'

import { LABEL, OBJECT, STRING, UNDEFINED } from '../common/consts'

const id = `[${LABEL}] `

export default function createIframeResize() {
  function setupDisconnectedIframe(element) {
    // Guard against SSR or early initialization when document.body doesn't exist yet
    if (!document.body) {
      // In SSR or before DOM ready, skip observer setup and just add to iFrames
      // The iframe will need to be initialized manually when added to the DOM
      return
    }

    const observer = new MutationObserver(() => {
      if (element.isConnected) {
        connectWithOptions(element)
        observer.disconnect()
      }
    })

    // Observe changes in the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true })
  }

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

      case !element.isConnected:
        setupDisconnectedIframe(element)
        iFrames.push(element)
        break

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
