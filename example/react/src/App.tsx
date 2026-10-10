import { useRef, useState } from 'react'
import IframeResizer, {
  type IFrameDirection,
  type IFrameForwardRef,
  type IFrameMessageData,
  type IFrameResizedData,
} from '@iframe-resizer/react'

import './App.css'

// Each page sets <body data-example>, see index.html, two.html and width-*.html
const example = document.body.dataset.example ?? 'index'

const DIRECTIONS: Record<string, string> = {
  'width-inline': 'horizontal-inline',
  'width-block': 'horizontal-block',
}
const direction = DIRECTIONS[example] as IFrameDirection | undefined
const src = direction ? 'child/frame.animate-width.html' : 'child/frame.content.html'
const ids = example === 'two' ? ['myIframe1', 'myIframe2'] : ['myIframe']

function Nav() {
  return (
    <nav>
      <a href="index.html">One iframe</a>
      <a href="two.html">Two iframes</a>
      <a href="width-inline.html">Width (inline)</a>
      <a href="width-block.html">Width (block)</a>
    </nav>
  )
}

function App() {
  const iframeRefs = useRef<Record<string, IFrameForwardRef | null>>({})
  const [messageData, setMessageData] = useState<IFrameResizedData | IFrameMessageData>()
  const [show, setShow] = useState(true)

  const onResized = (data: IFrameResizedData) => setMessageData(data)

  const onMessage = (data: IFrameMessageData) => {
    setMessageData(data)
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
    iframeRefs.current[data.iframe.id]?.sendMessage('Hello back from the parent page')
  }

  return (
    <>
      <h2>@iframe-resizer/react example</h2>
      <Nav />
      <button onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
      {show &&
        <>
          <div className={`frames ${direction ? 'width' : ''}`}>
            {ids.map((id) => (
              <IframeResizer
                key={id}
                license="GPLv3"
                log
                id={id}
                ref={(ref) => {
                  iframeRefs.current[id] = ref
                }}
                {...(direction && { direction })}
                inPageLinks
                onMessage={onMessage}
                onResized={onResized}
                src={src}
              />
            ))}
          </div>
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
