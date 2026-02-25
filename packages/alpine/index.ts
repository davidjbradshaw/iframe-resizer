import connectResizer from '@iframe-resizer/core'
import type { IFrameOptions } from '@iframe-resizer/core'

export type { IFrameOptions }

interface AlpineDirectiveContext {
  evaluate: (expression: string) => unknown
  cleanup: (fn: () => void) => void
}

interface Alpine {
  directive(
    name: string,
    callback: (
      el: HTMLIFrameElement,
      attributes: { expression: string },
      context: AlpineDirectiveContext,
    ) => void,
  ): void
}

export default function IframeResizerAlpine(Alpine: Alpine): void {
  Alpine.directive(
    'iframe-resizer',
    (el, { expression }, { evaluate, cleanup }) => {
      const options = (
        expression ? (evaluate(expression) ?? {}) : {}
      ) as IFrameOptions

      const resizer = connectResizer({
        waitForLoad: true,
        ...options,
        onBeforeClose: () => {
          console.warn(
            `[iframe-resizer/alpine][${el.id}] Close event ignored, use Alpine.js x-if to remove the iframe.`,
          )
          return false
        },
      })(el)

      cleanup(() => resizer?.disconnect())
    },
  )
}
