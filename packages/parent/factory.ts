import { LABEL, OBJECT, STRING, UNDEFINED } from '@iframe-resizer/common/consts'
import connectResizer, {
  type IframeComponent,
  type IframeOptions,
} from '@iframe-resizer/core'

const id = `[${LABEL}] `

export default function createIframeResize() {
  let connectWithOptions: (iframe: HTMLIFrameElement) => any
  let iframes: IframeComponent[]

  function setupDisconnectedIframe(element: HTMLIFrameElement): void {
    const observer = new MutationObserver(() => {
      if (element.isConnected) {
        connectWithOptions(element)
        observer.disconnect()
      }
    })

    // Observe changes in the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true })
  }

  function setup(element: any): void {
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
        iframes.push(element)
        break

      default:
        connectWithOptions(element)
        iframes.push(element)
    }
  }

  return function (
    options: IframeOptions,
    target?: string | HTMLElement,
  ): readonly IframeComponent[] {
    if (typeof window === UNDEFINED) return [] // don't run for server side render

    // Check if document.body exists in browser environment
    if (!document.body) {
      throw new TypeError(
        `${id}document.body is not available. Ensure the DOM is fully loaded before calling iframeResize().`,
      )
    }

    connectWithOptions = connectResizer(options)
    iframes = [] // Only return iframes passed in on this call

    switch (typeof target) {
      case UNDEFINED:
      case STRING:
        document.querySelectorAll((target as string) || 'iframe').forEach(setup)
        break

      case OBJECT:
        setup(target)
        break

      default:
        throw new TypeError(`${id}Unexpected data type (${typeof target})`)
    }

    return Object.freeze(iframes)
  }
}
