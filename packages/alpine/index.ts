import { esModuleInterop } from '@iframe-resizer/common/utils'
import type { IframeOptions } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

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

export default function IframeResizer(Alpine: Alpine): void {
  Alpine.directive(
    'iframe-resizer',
    (el, { expression }, { evaluate, cleanup }) => {
      const consoleGroup = createAutoConsoleGroup()

      consoleGroup.label(`alpine(${el.id})`)
      consoleGroup.event('setup')

      const evaluated = expression ? evaluate(expression) : {}
      const options =
        evaluated !== null &&
        evaluated !== undefined &&
        typeof evaluated === 'object'
          ? (evaluated as IframeOptions)
          : {}

      if (
        evaluated !== null &&
        evaluated !== undefined &&
        typeof evaluated !== 'object'
      ) {
        consoleGroup.warn(
          `x-iframe-resizer expression must evaluate to an options object, got ${typeof evaluated}`,
        )
      }

      const resizer = connectResizer({
        waitForLoad: true,
        ...options,
        onBeforeClose: () => {
          consoleGroup.event('close')
          consoleGroup.warn(
            'Close event ignored, use Alpine.js x-if to remove the iframe.',
          )
          return false
        },
      })(el)

      cleanup(() => resizer?.disconnect())
    },
  )
}

export type {
  IframeComponent,
  IframeMessageData,
  IframeMouseData,
  IframeObject,
  IframeOptions,
  IframeResizedData,
  IframeScrollData,
} from '@iframe-resizer/core'
