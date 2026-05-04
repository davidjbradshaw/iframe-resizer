import type {
  IFrameComponent,
  IFrameObject,
  IFrameOptions,
} from '@iframe-resizer/core'
import type React from 'react'
import type { RefObject } from 'react'

export type IFrameForwardRef = Omit<IFrameObject, 'close' | 'disconnect'> & {
  /** @deprecated Use getRef() instead */
  getElement: () => IFrameComponent
  getRef: () => RefObject<IFrameComponent | null>
}

type IframeProps = React.DetailedHTMLProps<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>

export type IFrameResizerProps = Omit<IframeProps, 'scrolling'> &
  Omit<IFrameOptions, 'id' | 'onBeforeClose'>
