import { SvelteComponent } from 'svelte'
import type { IframeOptions } from '@iframe-resizer/core'

export type IframeResizerProps = Omit<IframeOptions, 'id' | 'onBeforeClose'> & {
  [key: string]: any
}

export interface IframeResizerMethods {
  moveToAnchor(anchor: string): void
  sendMessage(msg: any, target?: string): void
}

declare class IframeResizer extends SvelteComponent<IframeResizerProps> {
  moveToAnchor(anchor: string): void
  sendMessage(msg: any, target?: string): void
}

export default IframeResizer
