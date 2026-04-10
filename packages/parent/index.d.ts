export type {
  IframeComponent,
  IframeMessageData,
  IframeMouseData,
  IframeObject,
  IframeOptions,
  IframeResizedData,
  IframeScrollData,
} from '@iframe-resizer/core'

import type { IframeComponent, IframeOptions } from '@iframe-resizer/core'

declare function iframeResize(
  options: IframeOptions,
  target?: string | HTMLIFrameElement,
): IframeComponent[]

export default iframeResize
