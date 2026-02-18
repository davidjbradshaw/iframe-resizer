import { useRef, useState } from 'react'
import IframeResizer from '@iframe-resizer/react'

import MessageData from './message-data.tsx'

import './App.css'

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

function App() {
  const iframeRef = useRef<IframeResizer.IFrameForwardRef>(null)
  const [messageData, setMessageData] = useState<ResizedEvent | MessageEvent>()
  const [show, setShow] = useState(true)

  const onResized = (data: ResizedEvent) => setMessageData(data)

  const onMessage = (data: MessageEvent) => {
    setMessageData(data)
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
    iframeRef.current?.sendMessage('Hello back from the parent page')
  }

  return (
    <>
      <h2>@iframe-resizer/react example</h2>
      <button onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
      {show &&
        <>
          <IframeResizer
            license="GPLv3"
            log
            forwardRef={iframeRef}
            inPageLinks
            onMessage={onMessage}
            onResized={onResized}
            src="child/frame.content.html"
            style={{ width: '100%', height: '100vh' }}
          />
          <MessageData data={messageData} />
        </>
      }
    </>
  )
}

export default App
