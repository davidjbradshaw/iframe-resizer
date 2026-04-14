import type { DefineComponent } from 'vue'
import type { IframeObject, IframeOptions } from '@iframe-resizer/core'

export type IframeResizerProps = Omit<IframeOptions, 'id' | 'onBeforeClose'>

export type IframeResizerMethods = Pick<IframeObject, 'moveToAnchor' | 'sendMessage'>

export type IframeResizerEmits = {
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
