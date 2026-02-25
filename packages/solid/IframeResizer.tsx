import connectResizer from '@iframe-resizer/core'
import type {
  IFrameComponent,
  IFrameMessageData,
  IFrameMouseData,
  IFrameObject,
  IFrameResizedData,
  IFrameScrollData,
} from '@iframe-resizer/core'
import acg from 'auto-console-group'
import type { ComponentProps } from 'solid-js'
import { onCleanup, onMount, splitProps } from 'solid-js'

// Deal with UMD not converting default exports to named exports
// eslint-disable-next-line no-underscore-dangle
const esModuleInterop = (mod: any): any => (mod?.__esModule ? mod.default : mod)
const createAutoConsoleGroup = esModuleInterop(acg)

export type IframeResizerMethods = Pick<
  IFrameObject,
  'moveToAnchor' | 'resize' | 'sendMessage'
> & {
  getElement: () => IFrameComponent
}

export type IframeResizerProps = {
  license: string
  bodyBackground?: string | null
  bodyMargin?: string | number | null
  bodyPadding?: string | number | null
  checkOrigin?: boolean | string[]
  direction?: 'vertical' | 'horizontal' | 'none' | 'both'
  inPageLinks?: boolean
  log?: boolean | 'expanded' | 'collapsed'
  offsetSize?: number
  scrolling?: boolean | 'omit'
  tolerance?: number
  waitForLoad?: boolean
  warningTimeout?: number
  onReady?: (iframe: IFrameComponent) => void
  onMessage?: (data: IFrameMessageData) => void
  onResized?: (data: IFrameResizedData) => void
  onScroll?: (data: IFrameScrollData) => boolean
  onMouseEnter?: (data: IFrameMouseData) => void
  onMouseLeave?: (data: IFrameMouseData) => void
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

export default function IframeResizer(props: IframeResizerProps) {
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
      waitForLoad,
      warningTimeout,
      onReady,
      onMessage,
      onResized,
      onScroll,
      onMouseEnter,
      onMouseLeave,
      ref: setRef,
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
      onReady,
      onMessage,
      onResized,
      onScroll,
      onMouseEnter,
      onMouseLeave,
    }

    const resizer = connectResizer(options)(iframeEl)

    consoleGroup.expand(log === 'expanded')
    if (log) consoleGroup.log('Created Solid component')

    if (typeof setRef === 'function') {
      setRef({
        getElement: () => iframeEl,
        moveToAnchor: (anchor) => resizer?.moveToAnchor(anchor),
        resize: () => resizer?.resize(),
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
