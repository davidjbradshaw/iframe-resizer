import { useRef, useState } from 'react'
import IframeResizer, {
  type IframeForwardRef,
  type IframeMessageData,
  type IframeResizedData,
} from '@iframe-resizer/react'

function App() {
  const iframeRef = useRef<IframeForwardRef>(null)
  const [messageData, setMessageData] = useState<IframeResizedData | IframeMessageData>()
  const [show, setShow] = useState(true)

  const onResized = (data: IframeResizedData) => setMessageData(data)

  const onMessage = (data: IframeMessageData) => {
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
            src="child/frame.test.html"
            style={{ width: '100%', height: '100vh' }}
          />
          {messageData && (
            <div>
              {'message' in messageData
                ? <span><b>Message:</b> {messageData.message}</span>
                : <span><b>Height:</b> {messageData.height} <b>Width:</b> {messageData.width} <b>Type:</b> {messageData.type}</span>
              }
            </div>
          )}
        </>
      }
    </>
  )
}

export default App
