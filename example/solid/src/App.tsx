import { createSignal, Show } from 'solid-js'
import IframeResizer from '@iframe-resizer/solid'
import type { IframeResizerMethods } from '@iframe-resizer/solid'

import MessageData from './message-data'
import type { MessageEvent, ResizedEvent } from './types'

import './App.css'

function App() {
  let iframeApi: IframeResizerMethods | undefined
  const [messageData, setMessageData] = createSignal<ResizedEvent | MessageEvent>()
  const [show, setShow] = createSignal(true)

  const onResized = (data: ResizedEvent) => setMessageData(data)

  const onMessage = (data: MessageEvent) => {
    setMessageData(data)
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
    iframeApi?.sendMessage('Hello back from the parent page')
  }

  return (
    <>
      <h2>@iframe-resizer/solid example</h2>
      <button onClick={() => setShow(!show())}>{show() ? 'Hide' : 'Show'}</button>
      <Show when={show()}>
        <IframeResizer
          license="GPLv3"
          id="myIframe"
          log
          ref={(r) => (iframeApi = r)}
          inPageLinks
          onMessage={onMessage}
          onResized={onResized}
          src="child/frame.content.html"
          style={{ width: '100%', height: '100vh' }}
        />
        <MessageData data={messageData()} />
      </Show>
    </>
  )
}

export default App
