import type IframeResizer from '@iframe-resizer/react'

export type ResizedEvent = {
  iframe: IframeResizer.IFrameComponent
  height: number
  width: number
  type: string
}

export type MessageEvent = {
  iframe: IframeResizer.IFrameComponent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any
}
