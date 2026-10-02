import { useRef, useState } from 'react'
import IframeResizer, {
  type IFrameForwardRef,
  type IFrameMessageData,
  type IFrameResizedData,
} from '@iframe-resizer/react'


import './App.css'

function App() {
  const iframeRef = useRef<IFrameForwardRef>(null)
  const [messageData, setMessageData] = useState<IFrameResizedData | IFrameMessageData>()
  const [show, setShow] = useState(true)

  const onResized = (data: IFrameResizedData) => setMessageData(data)

  const onMessage = (data: IFrameMessageData) => {
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
            ref={iframeRef}
            inPageLinks
            onMessage={onMessage}
            onResized={onResized}
            src="child/frame.content.html"
            style={{ width: '100%', height: '100vh' }}
          />
          {messageData && (
            <div className="message-data">
              <h3>Event Data:</h3>
              <pre>
                {JSON.stringify(messageData, (key, value) => (key === 'iframe' ? undefined : value), 2)}
              </pre>
            </div>
          )}
        </>
      }
    </>
  )
}

export default App
