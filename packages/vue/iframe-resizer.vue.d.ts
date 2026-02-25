import type { DefineComponent } from 'vue'

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
export interface IframeResizerMethods {
  moveToAnchor(anchor: string): void
  resize(): void
  sendMessage(msg: any, target?: string): void
}

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
