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

// The component keeps these off the iframe and calls them with
// iframe-resizer data, so React's DOM event versions are left out
type ResizerCallbacks = 'onScroll' | 'onMouseEnter' | 'onMouseLeave'

// onBeforeClose is overridden and onAfterClose never fires: close is
// ignored in React, remove the component instead
export type IFrameResizerProps = Omit<
  IframeProps,
  'scrolling' | ResizerCallbacks
> &
  Omit<IFrameOptions, 'id' | 'onBeforeClose' | 'onAfterClose'>
