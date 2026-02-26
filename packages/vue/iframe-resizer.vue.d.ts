import type { DefineComponent } from 'vue'
import type { IFrameObject } from '@iframe-resizer/core'

export interface IframeResizerProps {
  license: string
  bodyBackground?: string
  bodyMargin?: string
  bodyPadding?: string
  checkOrigin?: boolean
  direction?: string
  log?: 'expanded' | 'collapsed' | boolean | number
  inPageLinks?: boolean
  offset?: number
  scrolling?: boolean
  tolerance?: number
  warningTimeout?: number
}

/** Methods exposed via defineExpose, accessible on template refs */
export type IframeResizerMethods = Pick<IFrameObject, 'moveToAnchor' | 'resize' | 'sendMessage'>

export interface IframeResizerEmits {
  onReady: (...args: any[]) => void
  onMessage: (...args: any[]) => void
  onResized: (...args: any[]) => void
}

declare const IframeResizer: DefineComponent<
  IframeResizerProps,
  IframeResizerMethods,
  {},
  {},
  {},
  {},
  {},
  IframeResizerEmits
>

export default IframeResizer
