import { setupEventListeners, setupIFrame } from './main'

let setupComplete = false

export default function createIframeResize() {
  function setup(options, element) {
    function chkType() {
      if (!element.tagName) {
        throw new TypeError('Object is not a valid DOM element')
      } else if (element.tagName.toUpperCase() !== 'IFRAME') {
        throw new TypeError(`Expected <IFRAME> tag, found <${element.tagName}>`)
      }
    }

    if (element) {
      chkType()
      setupIFrame(element, options)
      iFrames.push(element)
    }
  }

  let iFrames

  if (!setupComplete) {
    setupEventListeners()
    setupComplete = true
  }

  return function (options, target) {
    if (typeof window === 'undefined') return [] // don't run for server side render

    iFrames = [] // Only return iFrames past in on this call

    switch (typeof target) {
      case 'undefined':
      case 'string':
        Array.prototype.forEach.call(
          document.querySelectorAll(target || 'iframe'),
          setup.bind(undefined, options),
        )
        break

      case 'object':
        setup(options, target)
        break

      default:
        throw new TypeError(`Unexpected data type (${typeof target})`)
    }

    return iFrames
  }
}
