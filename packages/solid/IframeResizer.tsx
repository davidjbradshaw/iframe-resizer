import { esModuleInterop } from '@iframe-resizer/common'
import type {
  IFrameComponent,
  IFrameDirection,
  IFrameLogOption,
  IFrameMessageData,
  IFrameMouseData,
  IFrameObject,
  IFrameResizedData,
  IFrameScrollData,
  IFrameScrollOption,
} from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import type { ComponentProps, JSX } from 'solid-js'
import { onCleanup, onMount, splitProps } from 'solid-js'

const createAutoConsoleGroup = esModuleInterop(acg)

export type IFrameResizerMethods = Pick<
  IFrameObject,
  'moveToAnchor' | 'sendMessage'
> & {
  getElement: () => IFrameComponent
}

export type IFrameResizerProps = {
  license: string
  bodyBackground?: string | null
  bodyMargin?: string | number | null
  bodyPadding?: string | number | null
  checkOrigin?: boolean | string[]
  direction?: IFrameDirection
  inPageLinks?: boolean
  log?: IFrameLogOption
  offsetSize?: number
  scrolling?: IFrameScrollOption
  tolerance?: number
  warningTimeout?: number
  onReady?: (iframe: IFrameComponent) => void
  onMessage?: (data: IFrameMessageData) => void
  onResized?: (data: IFrameResizedData) => void
  onScroll?: (data: IFrameScrollData) => boolean
  onMouseEnter?: (data: IFrameMouseData) => void
  onMouseLeave?: (data: IFrameMouseData) => void
  ref?: (methods: IFrameResizerMethods) => void
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
  'warningTimeout',
  'onReady',
  'onMessage',
  'onResized',
  'onScroll',
  'onMouseEnter',
  'onMouseLeave',
  'ref',
] as const

export default function IframeResizer(props: IFrameResizerProps): JSX.Element {
  let iframeEl!: IFrameComponent
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
