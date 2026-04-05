import { SvelteComponent } from 'svelte'

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
  [key: string]: any
}

export interface IframeResizerMethods {
  moveToAnchor(anchor: string): void
  resize(): void
  sendMessage(msg: any, target?: string): void
}

declare class IframeResizer extends SvelteComponent<IframeResizerProps> {
  moveToAnchor(anchor: string): void
  resize(): void
  sendMessage(msg: any, target?: string): void
}

export default IframeResizer
