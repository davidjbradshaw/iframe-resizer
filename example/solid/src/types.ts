import type { IframeResizerMethods } from '@iframe-resizer/solid'

type IFrameComponent = HTMLIFrameElement & { iframeResizer: IframeResizerMethods }

export type ResizedEvent = {
  iframe: IFrameComponent
  height: number
  width: number
  type: string
}

export type MessageEvent = {
  iframe: IFrameComponent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any
}
