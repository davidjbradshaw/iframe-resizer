import type IframeResizer from '@iframe-resizer/react'

type ResizedEvent = {
  iframe: IframeResizer.IFrameComponent
  height: number
  width: number
  type: string
}

type MessageEvent = {
  iframe: IframeResizer.IFrameComponent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any
}

type MessageDataProps = {
  data?: ResizedEvent | MessageEvent
}

const MessageData = ({ data }: MessageDataProps) =>
  data ? (
    'message' in data ? (
      <span>
        <b>Frame ID:</b> {data.iframe.id} <br/>
        <b>Message:</b> {data.message}
      </span>
    ) : (
      <span>
        <b>Frame ID:</b> {data.iframe.id} <br/>
        <b>Height:</b> {data.height} <br/>
        <b>Width:</b> {data.width} <br/>
        <b>Event type:</b> {data.type}
      </span>
    )
  ) : null

export default MessageData
