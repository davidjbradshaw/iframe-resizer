import { LABEL, OBJECT, STRING, UNDEFINED } from '@iframe-resizer/common/consts'
import connectResizer, {
  type IframeComponent,
  type IframeObject,
  type IframeOptions,
} from '@iframe-resizer/core'

const id = `[${LABEL}] `

export default function createIframeResize() {
  let connectWithOptions: (
    iframe: HTMLIFrameElement,
  ) => IframeObject | undefined
  let iframes: HTMLIFrameElement[]

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

  function setup(el: Element | HTMLElement): void {
    switch (true) {
      case !el:
        throw new TypeError(`${id}iframe is not defined`)

      case !el.tagName:
        throw new TypeError(`${id}Not a valid DOM element`)

      case el.tagName.toUpperCase() !== 'IFRAME':
        throw new TypeError(`${id}Expected <IFRAME> tag, found <${el.tagName}>`)

      default: {
        const iframe = el as HTMLIFrameElement

        if (iframe.isConnected) {
          connectWithOptions(iframe)
        } else {
          setupDisconnectedIframe(iframe)
        }

        iframes.push(iframe)
      }
    }
  }

  return function (
    options: IframeOptions,
    target?: string | HTMLIFrameElement,
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
        setup(target as HTMLIFrameElement)
        break

      default:
        throw new TypeError(`${id}Unexpected data type (${typeof target})`)
    }

    return Object.freeze(iframes) as readonly IframeComponent[]
  }
}
