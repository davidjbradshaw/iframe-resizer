import connectResizer from '../core/index'

const id = '[iframeResize]'

export default function createIframeResize() {
  function setup(element) {
    switch (true) {
      case !element:
        throw new TypeError(id + 'iframe is not defined')

      case !element.tagName:
        throw new TypeError(id + 'Not a valid DOM element')

      case element.tagName.toUpperCase() !== 'IFRAME':
        throw new TypeError(id + `Expected <IFRAME> tag, found <${element.tagName}>`)

      default:
        connectWithOptions(element)
        iFrames.push(element)
    }
  }

  let connectWithOptions
  let iFrames

  return function (options, target) {
    if (typeof window === 'undefined') return [] // don't run for server side render

    connectWithOptions = connectResizer(options)
    iFrames = [] // Only return iFrames past in on this call

    switch (typeof target) {
      case 'undefined':
      case 'string':
        ;[...document.querySelectorAll(target || 'iframe')].forEach(setup)
        break

      case 'object':
        setup(target)
        break

      default:
        throw new TypeError(`Unexpected data type (${typeof target})`)
    }

    return iFrames
  }
}
