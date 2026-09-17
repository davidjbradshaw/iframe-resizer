import { render } from 'solid-js/web'
import IframeResizer from '@iframe-resizer/solid'
import type { IframeMessageData, IframeResizedData } from '@iframe-resizer/solid'

function App() {
  const onResized = (data: IframeResizedData) => {
    console.log('resized', data.height, data.width)
  }

  const onMessage = (data: IframeMessageData) => {
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }

  return (
    <>
      <h2>@iframe-resizer/solid example</h2>
      <IframeResizer
        license="GPLv3"
        id="myIframe"
        log
        inPageLinks
        onMessage={onMessage}
        onResized={onResized}
        src="child/frame.test.html"
        style={{ width: '100%', height: '100vh' }}
      />
    </>
  )
}

render(() => <App />, document.getElementById('root')!)
