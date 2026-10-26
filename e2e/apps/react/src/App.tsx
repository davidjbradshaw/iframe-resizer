import { useRef, useState } from 'react'
import IframeResizer, {
  type IframeForwardRef,
  type IframeMessageData,
  type IframeResizedData,
} from '@iframe-resizer/react'
import { record, updates } from '../../../shared/app'

// Option changes applied after init by the e2e tests, one button per step
const UPDATES = updates(location.origin)

type Extra = Partial<(typeof UPDATES)[keyof typeof UPDATES]>

function App() {
  const iframeRef = useRef<IframeForwardRef>(null)
  const [messageData, setMessageData] = useState<IframeResizedData | IframeMessageData>()
  const [show, setShow] = useState(true)
  const [extra, setExtra] = useState<Extra>({})

  const onReady = () => record('onReady')

  const onResized = (data: IframeResizedData) => {
    record('onResized', { type: data.type })
    setMessageData(data)
  }

  const onMessage = (data: IframeMessageData) => {
    record('onMessage', { message: data.message })
    setMessageData(data)
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
    iframeRef.current?.sendMessage('Hello back from the parent page')
  }

  const onScroll = () => {
    record('onScroll')
    return true
  }

  return (
    <>
      <h2>@iframe-resizer/react example</h2>
      <button onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
      {Object.entries(UPDATES).map(([step, options]) => (
        <button
          key={step}
          id={`update-${step}`}
          onClick={() => setExtra((prev) => ({ ...prev, ...options }))}
        >
          Update {step}
        </button>
      ))}
      {show &&
        <>
          <IframeResizer
            license="GPLv3"
            log
            ref={iframeRef}
            inPageLinks
            {...extra}
            onMessage={onMessage}
            onReady={onReady}
            onResized={onResized}
            onScroll={onScroll}
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
