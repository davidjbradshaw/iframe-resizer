import { ResizedEvent, MessageEvent } from './iframe-events'

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
