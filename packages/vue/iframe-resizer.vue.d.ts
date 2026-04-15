import type { DefineComponent } from 'vue'
import type {
  IframeComponent,
  IframeMessageData,
  IframeObject,
  IframeOptions,
  IframeResizedData,
} from '@iframe-resizer/core'

export type IframeResizerProps = Omit<IframeOptions, 'id' | 'onBeforeClose'>

export type IframeResizerMethods = Pick<IframeObject, 'moveToAnchor' | 'sendMessage'>

export type IframeResizerEmits = {
  onReady: (iframe: IframeComponent) => void
  onMessage: (data: IframeMessageData) => void
  onResized: (data: IframeResizedData) => void
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
