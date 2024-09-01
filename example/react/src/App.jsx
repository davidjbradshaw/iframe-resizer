import { useRef, useState } from 'react'
import IframeResizer from '@iframe-resizer/react'

import MessageData from './message-data.jsx'

import './App.css'

function App() {
  const iframeRef = useRef(null)
  const [messageData, setMessageData] = useState()
  const [show, setShow] = useState(true)

  const onResized = (data) => setMessageData(data)

  const onMessage = (data) => {
    setMessageData(data)
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
    iframeRef.current.sendMessage('Hello back from the parent page')
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
