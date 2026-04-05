import type { MessageEvent, ResizedEvent } from './types'

type Props = {
  data?: ResizedEvent | MessageEvent
}

const MessageData = (props: Props) =>
  props.data ? (
    'message' in props.data ? (
      <span>
        <b>Frame ID:</b> {props.data.iframe.id} <br />
        <b>Message:</b> {props.data.message}
      </span>
    ) : (
      <span>
        <b>Frame ID:</b> {props.data.iframe.id} <br />
        <b>Height:</b> {props.data.height} <br />
        <b>Width:</b> {props.data.width} <br />
        <b>Event type:</b> {props.data.type}
      </span>
    )
  ) : null

export default MessageData
