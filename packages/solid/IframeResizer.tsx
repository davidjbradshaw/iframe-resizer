import { esModuleInterop } from '@iframe-resizer/common'
import type {
  Direction,
  IframeComponent,
  IframeMessageData,
  IframeMouseData,
  IframeObject,
  IframeResizedData,
  IframeScrollData,
  LogOption,
  ScrollOption,
} from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import type { ComponentProps, JSX } from 'solid-js'
import { onCleanup, onMount, splitProps } from 'solid-js'

const createAutoConsoleGroup = esModuleInterop(acg)

export type IframeResizerMethods = Pick<
  IframeObject,
  'moveToAnchor' | 'sendMessage'
> & {
  getElement: () => IframeComponent
}

export type IframeResizerProps = {
  license: string
  bodyBackground?: string | null
  bodyMargin?: string | number | null
  bodyPadding?: string | number | null
  checkOrigin?: boolean | string[]
  direction?: Direction
  inPageLinks?: boolean
  log?: LogOption
  offsetSize?: number
  scrolling?: ScrollOption
  tolerance?: number
  waitForLoad?: boolean
  warningTimeout?: number
  onReady?: (iframe: IframeComponent) => void
  onMessage?: (data: IframeMessageData) => void
  onResized?: (data: IframeResizedData) => void
  onScroll?: (data: IframeScrollData) => boolean
  onMouseEnter?: (data: IframeMouseData) => void
  onMouseLeave?: (data: IframeMouseData) => void
  ref?: (methods: IframeResizerMethods) => void
} & Omit<
  ComponentProps<'iframe'>,
  'scrolling' | 'ref' | 'onScroll' | 'onMouseEnter' | 'onMouseLeave'
>

const RESIZER_KEYS = [
  'license',
  'bodyBackground',
  'bodyMargin',
  'bodyPadding',
  'checkOrigin',
  'direction',
  'inPageLinks',
  'log',
  'offsetSize',
  'scrolling',
  'tolerance',
  'waitForLoad',
  'warningTimeout',
  'onReady',
  'onMessage',
  'onResized',
  'onScroll',
  'onMouseEnter',
  'onMouseLeave',
  'ref',
] as const

export default function IframeResizer(props: IframeResizerProps): JSX.Element {
  let iframeEl!: IframeComponent
  const [local, iframeProps] = splitProps(props, RESIZER_KEYS)
  const consoleGroup = createAutoConsoleGroup()

  onMount(() => {
    const {
      license,
      bodyBackground,
      bodyMargin,
      bodyPadding,
      checkOrigin,
      direction,
      inPageLinks,
      log,
      offsetSize,
      scrolling,
      tolerance,
      waitForLoad,
      warningTimeout,
      onReady,
      onMessage,
      onResized,
      onScroll,
      onMouseEnter,
      onMouseLeave,
      ref: setRef,
      // eslint-disable-next-line solid/reactivity -- intentional: this is a one-shot setup; the library does not support re-initializing an element
    } = local

    consoleGroup.label(`solid(${iframeEl.id})`)
    consoleGroup.event('setup')

    const options: Record<string, any> = {
      ...Object.fromEntries(
        Object.entries({
          license,
          bodyBackground,
          bodyMargin,
          bodyPadding,
          checkOrigin,
          direction,
          inPageLinks,
          log,
          offsetSize,
          scrolling,
          tolerance,
          warningTimeout,
        }).filter(([, v]) => v !== undefined),
      ),
      waitForLoad: waitForLoad ?? true,
      onBeforeClose: () => {
        consoleGroup.warn(
          'Close method is disabled, use Solid to remove the iframe.',
        )
        return false
      },
      ...Object.fromEntries(
        Object.entries({
          onReady,
          onMessage,
          onResized,
          onScroll,
          onMouseEnter,
          onMouseLeave,
        }).filter(([, v]) => v !== undefined),
      ),
    }

    const resizer = connectResizer(options)(iframeEl)

    consoleGroup.expand(log === 'expanded')
    if (log) consoleGroup.log('Created Solid component')

    if (typeof setRef === 'function') {
      setRef({
        getElement: () => iframeEl,
        moveToAnchor: (anchor) => resizer?.moveToAnchor(anchor),
        sendMessage: (message, targetOrigin) =>
          resizer?.sendMessage(message, targetOrigin),
      })
    }

    onCleanup(() => {
      consoleGroup.endAutoGroup()
      resizer?.disconnect()
    })
  })

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...iframeProps} ref={iframeEl} />
}
