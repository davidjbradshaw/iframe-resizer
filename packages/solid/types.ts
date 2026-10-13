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
import type { ComponentProps } from 'solid-js'

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
