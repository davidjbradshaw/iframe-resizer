import { esModuleInterop } from '@iframe-resizer/common'
import type { IFrameObject, IFrameOptions } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

type EvaluateLater = (callback: (value: unknown) => void) => void

interface AlpineDirectiveContext {
  evaluateLater: (expression: string) => EvaluateLater
  effect: (fn: () => void) => void
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
    (el, { expression }, { evaluateLater, effect, cleanup }) => {
      const consoleGroup = createAutoConsoleGroup()

      consoleGroup.label(`alpine(${el.id})`)
      consoleGroup.event('setup')

      const getOptions: EvaluateLater = expression
        ? evaluateLater(expression)
        : (callback) => callback({})

      const toOptions = (evaluated: unknown): IFrameOptions => {
        if (evaluated !== null && evaluated !== undefined) {
          if (typeof evaluated === 'object') return evaluated as IFrameOptions

          consoleGroup.warn(
            `x-iframe-resizer expression must evaluate to an options object, got ${typeof evaluated}`,
          )
        }

        return {} as IFrameOptions
      }

      const onBeforeClose = (): boolean => {
        consoleGroup.event('close')
        consoleGroup.warn(
          'Close event ignored, use Alpine.js x-if to remove the iframe.',
        )
        return false
      }

      let resizer: IFrameObject | undefined

      // effect() runs now and again whenever reactive data read while
      // evaluating the expression changes. The first run binds the iframe;
      // later runs re-call connectResizer, which takes the update path in
      // core and sends the changed options to the child.
      effect(() => {
        getOptions((evaluated) => {
          const bound = connectResizer({
            ...toOptions(evaluated),
            onBeforeClose,
          })(el)

          resizer ??= bound
        })
      })

      cleanup(() => {
        resizer?.disconnect()
        consoleGroup.endAutoGroup()
      })
    },
  )
}

export type * from '@iframe-resizer/core'
